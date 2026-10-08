import { describe, expect, test } from 'vitest'
import type { EbayConfig, FeedConfig } from '../src/alerts/config'
import { EbaySource, buildSearchUrl, parseItem } from '../src/alerts/sources/ebay'
import { FeedSource } from '../src/alerts/sources/feed'
import { SourceError } from '../src/alerts/sources/types'
import { Clock, HOUR } from './support/alertes'

const EBAY: EbayConfig = {
	clientId: 'client-id',
	clientSecret: 'client-secret',
	campaignId: '5338123456',
	marketplace: 'EBAY_FR',
	apiBase: 'https://api.ebay.com',
	categoryId: undefined,
	dailyBudget: 100
}

interface Call {
	url: string
	init: RequestInit | undefined
	headers: Headers
}

type Reply = Response | (() => Response) | Error

function fakeFetch(replies: { token?: Array<Reply>; search?: Array<Reply>; feed?: Array<Reply> }) {
	const calls: Array<Call> = []
	const queues = { token: [...(replies.token ?? [])], search: [...(replies.search ?? [])], feed: [...(replies.feed ?? [])] }
	const fetch = async (url: string, init?: RequestInit) => {
		calls.push({ url, init, headers: new Headers(init?.headers) })
		const kind = url.includes('/oauth2/token') ? 'token' : url.includes('/item_summary/search') ? 'search' : 'feed'
		const next = queues[kind].shift()
		if (!next) throw new Error(`appel ${kind} inattendu`)
		if (next instanceof Error) throw next
		return typeof next === 'function' ? next() : next
	}
	return { fetch, calls }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const token = (value = 'jeton-application-1234', expires = 7200) => new Response(`{"access_token":"${value}","expires_in":${expires},"token_type":"Application Access Token"}`)

const summary = (id: string, extra: Record<string, unknown> = {}) => ({
	itemId: `v1|${id}|0`,
	title: `Carter embrayage Derbi ${id}`,
	price: { value: '45.00', currency: 'EUR' },
	image: { imageUrl: `https://i.ebayimg.com/images/g/${id}/s-l225.jpg` },
	itemWebUrl: `https://www.ebay.fr/itm/${id}`,
	itemAffiliateWebUrl: `https://www.ebay.fr/itm/${id}?mkcid=1&campid=5338123456&customid=alertes`,
	condition: 'Occasion',
	...extra
})

function ebay(replies: Parameters<typeof fakeFetch>[0], budget = { left: 100 }) {
	const clock = new Clock()
	const fake = fakeFetch(replies)
	const source = new EbaySource(EBAY, {
		fetch: fake.fetch,
		now: clock.now,
		takeCall: () => {
			if (budget.left <= 0) return false
			budget.left--
			return true
		}
	})
	return { source, clock, calls: fake.calls }
}

const QUERY = { query: 'Carter Derbi', reference: undefined, maxPriceCents: undefined }

describe('eBay : authentification', () => {
	test('jeton applicatif demandé en Basic avec la bonne portée', async () => {
		const { source, calls } = ebay({ token: [token()], search: [json({ itemSummaries: [] })] })
		await source.search(QUERY)
		const [auth] = calls
		expect(auth?.url).toBe('https://api.ebay.com/identity/v1/oauth2/token')
		expect(auth?.init?.method).toBe('POST')
		expect(auth?.headers.get('authorization')).toBe(`Basic ${Buffer.from('client-id:client-secret').toString('base64')}`)
		expect(auth?.headers.get('content-type')).toBe('application/x-www-form-urlencoded')
		const body = new URLSearchParams(String(auth?.init?.body))
		expect(body.get('grant_type')).toBe('client_credentials')
		expect(body.get('scope')).toBe('https://api.ebay.com/oauth/api_scope')
		expect(auth?.init?.redirect).toBe('error')
	})

	test('jeton réutilisé tant qu’il est valable puis renouvelé', async () => {
		const { source, clock, calls } = ebay({ token: [token('premier-jeton-1234'), token('second-jeton-12345')], search: [json({}), json({}), json({})] })
		await source.search(QUERY)
		await source.search(QUERY)
		expect(calls.filter((c) => c.url.includes('oauth2')).length).toBe(1)
		clock.advance(2 * HOUR)
		await source.search(QUERY)
		expect(calls.filter((c) => c.url.includes('oauth2')).length).toBe(2)
		expect(calls.at(-1)?.headers.get('authorization')).toBe('Bearer second-jeton-12345')
	})

	test('un 401 force un nouveau jeton et une seule nouvelle tentative', async () => {
		const ok = ebay({ token: [token('ancien-jeton-1234'), token('nouveau-jeton-123')], search: [json({}, 401), json({ itemSummaries: [summary('1')] })] })
		expect(await ok.source.search(QUERY)).toHaveLength(1)
		const ko = ebay({ token: [token(), token()], search: [json({}, 401), json({}, 401)] })
		await expect(ko.source.search(QUERY)).rejects.toThrow(SourceError)
	})

	test('jeton refusé ou réponse de jeton invalide', async () => {
		await expect(ebay({ token: [json({ error: 'invalid_client' }, 401)] }).source.search(QUERY)).rejects.toThrow('jeton eBay refusé (401)')
		await expect(ebay({ token: [new Response('{"access_token":"x","expires_in":7200}')] }).source.search(QUERY)).rejects.toThrow('réponse de jeton eBay invalide')
		await expect(ebay({ token: [new Response('pas du json')] }).source.search(QUERY)).rejects.toThrow('réponse de jeton eBay invalide')
	})
})

describe('eBay : recherche', () => {
	test('en-têtes de marché et d’affiliation', async () => {
		const { source, calls } = ebay({ token: [token()], search: [json({})] })
		await source.search(QUERY)
		const search = calls[1]
		expect(search?.headers.get('authorization')).toBe('Bearer jeton-application-1234')
		expect(search?.headers.get('x-ebay-c-marketplace-id')).toBe('EBAY_FR')
		expect(search?.headers.get('x-ebay-c-enduserctx')).toBe('affiliateCampaignId=5338123456,affiliateReferenceId=alertes')
		expect(search?.init?.redirect).toBe('error')
		expect(search?.init?.signal).toBeInstanceOf(AbortSignal)
	})

	test('construction de l’URL de recherche', () => {
		const url = new URL(buildSearchUrl({ ...EBAY, categoryId: '10063' }, { query: 'Carter Derbi', reference: undefined, maxPriceCents: 15050 }))
		expect(url.origin + url.pathname).toBe('https://api.ebay.com/buy/browse/v1/item_summary/search')
		expect(url.searchParams.get('q')).toBe('Carter Derbi')
		expect(url.searchParams.get('sort')).toBe('newlyListed')
		expect(url.searchParams.get('limit')).toBe('50')
		expect(url.searchParams.get('category_ids')).toBe('10063')
		expect(url.searchParams.get('filter')).toBe('deliveryCountry:FR,price:[..150.50],priceCurrency:EUR')
		const ref = new URL(buildSearchUrl(EBAY, { query: 'Carter', reference: '00H01205041', maxPriceCents: undefined }))
		expect(ref.searchParams.get('q')).toBe('00H01205041')
		expect(ref.searchParams.get('filter')).toBe('deliveryCountry:FR')
		expect(ref.searchParams.has('category_ids')).toBe(false)
		const long = new URL(buildSearchUrl(EBAY, { query: `a${'b'.repeat(300)}\u0000`, reference: undefined, maxPriceCents: undefined }))
		expect(long.searchParams.get('q')).toHaveLength(100)
	})

	test('lien affilié privilégié et données nettoyées', async () => {
		const { source } = ebay({
			token: [token()],
			search: [json({ itemSummaries: [summary('1', { title: 'Carter‮ Derbi\r\n 1' }), summary('2', { itemAffiliateWebUrl: undefined })] })]
		})
		const items = await source.search(QUERY)
		expect(items[0]).toEqual({
			source: 'ebay',
			itemId: 'v1|1|0',
			title: 'Carter Derbi 1',
			priceCents: 4500,
			currency: 'EUR',
			url: 'https://www.ebay.fr/itm/1?mkcid=1&campid=5338123456&customid=alertes',
			imageUrl: 'https://i.ebayimg.com/images/g/1/s-l225.jpg',
			condition: 'Occasion'
		})
		expect(items[1]?.url).toBe('https://www.ebay.fr/itm/2')
	})

	test('les annonces suspectes ou incomplètes sont écartées', () => {
		const bad = [
			summary('1', { itemAffiliateWebUrl: 'https://ebay.fr.evil.com/itm/1', itemWebUrl: 'http://www.ebay.fr/itm/1' }),
			summary('2', { itemAffiliateWebUrl: 'javascript:alert(1)', itemWebUrl: undefined }),
			summary('3', { itemId: '<script>' }),
			summary('4', { title: '' }),
			summary('5', { itemId: undefined }),
			'pas un objet',
			null
		]
		for (const raw of bad) expect(parseItem(raw)).toBeUndefined()
		expect(parseItem(summary('6', { image: { imageUrl: 'https://evil.com/x.jpg' } }))?.imageUrl).toBeUndefined()
		expect(parseItem(summary('7', { price: { value: 'gratuit', currency: 'EUR' } }))?.priceCents).toBeUndefined()
		expect(parseItem(summary('8', { price: { value: '12.00', currency: 'usd' } }))?.currency).toBe('EUR')
	})

	test('filtres prix et référence, doublons supprimés', async () => {
		const items = [summary('1'), summary('1'), summary('2', { price: { value: '300.00', currency: 'EUR' } }), summary('3', { title: 'Carter 00H-012-050-41 Derbi' })]
		const price = ebay({ token: [token()], search: [json({ itemSummaries: items })] })
		expect((await price.source.search({ ...QUERY, maxPriceCents: 10000 })).map((i) => i.itemId)).toEqual(['v1|1|0', 'v1|3|0'])
		const ref = ebay({ token: [token()], search: [json({ itemSummaries: items })] })
		expect((await ref.source.search({ ...QUERY, reference: '00H01205041' })).map((i) => i.itemId)).toEqual(['v1|3|0'])
	})

	test('erreurs eBay classées', async () => {
		const cases: Array<[Response | Error, string, boolean]> = [
			[json({}, 429), '429', true],
			[json({}, 503), '503', true],
			[json({ errors: [{ message: 'mauvais filtre' }] }, 400), '400', false],
			[new Response('<html>'), 'illisible', true],
			[new TypeError('fetch failed'), 'injoignable', true]
		]
		for (const [reply, message, retryable] of cases) {
			const { source } = ebay({ token: [token()], search: [reply] })
			const error = await source.search(QUERY).catch((e: unknown) => e)
			expect(error).toBeInstanceOf(SourceError)
			expect((error as SourceError).message).toContain(message)
			expect((error as SourceError).retryable).toBe(retryable)
		}
	})

	test('quota épuisé : aucun appel de recherche n’est fait', async () => {
		const budget = { left: 1 }
		const { source, calls } = ebay({ token: [token()], search: [json({})] }, budget)
		await source.search(QUERY)
		const error = await source.search(QUERY).catch((e: unknown) => e)
		expect((error as SourceError).budgetExhausted).toBe(true)
		expect(calls.filter((c) => c.url.includes('search')).length).toBe(1)
	})
})

const FEED: FeedConfig = {
	name: 'muc-off',
	url: 'https://flux.exemple.com/produits.csv',
	delimiter: ';',
	columns: { id: 'SKU', title: 'Nom', url: 'Lien', price: 'Prix', image: 'Image', availability: 'Stock' },
	refreshMinutes: 360,
	maxBytes: 2000
}

const CSV = [
	'SKU;Nom;Lien;Prix;Image;Stock',
	'A1;Kit nettoyage moto Muc-Off;https://track.exemple.com/a1;29,90;https://img.exemple.com/a1.jpg;in stock',
	'A2;Nettoyant chaîne Muc-Off;https://track.exemple.com/a2;12.50;http://img.exemple.com/a2.jpg;in stock',
	'A3;Kit nettoyage moto épuisé;https://track.exemple.com/a3;19;;out of stock',
	'A4;Kit nettoyage pirate;javascript:alert(1);5;;in stock',
	';Kit nettoyage sans identifiant;https://track.exemple.com/a5;45;;',
	'A6;Carter 00H-012-050-41;https://track.exemple.com/a6;80;;1'
].join('\n')

function feed(replies: Array<Reply>, config: Partial<FeedConfig> = {}) {
	const clock = new Clock()
	const fake = fakeFetch({ feed: replies })
	return { source: new FeedSource({ ...FEED, ...config }, { fetch: fake.fetch, now: clock.now }), clock, calls: fake.calls }
}

describe('flux d’affiliation', () => {
	test('lecture, filtrage des lignes invalides et correspondance', async () => {
		const { source } = feed([new Response(CSV)])
		const items = await source.search({ query: 'kit nettoyage', reference: undefined, maxPriceCents: undefined })
		expect(items.map((i) => i.title)).toEqual(['Kit nettoyage moto Muc-Off', 'Kit nettoyage sans identifiant'])
		expect(items[0]).toMatchObject({ source: 'muc-off', itemId: 'A1', priceCents: 2990, imageUrl: 'https://img.exemple.com/a1.jpg' })
		expect(items[1]?.itemId).toMatch(/^[a-f0-9]{24}$/)
	})

	test('image non https ignorée, prix et référence filtrés', async () => {
		const { source } = feed([new Response(CSV)])
		const chain = await source.search({ query: 'nettoyant chaine', reference: undefined, maxPriceCents: undefined })
		expect(chain[0]?.imageUrl).toBeUndefined()
		expect(await source.search({ query: 'kit nettoyage', reference: undefined, maxPriceCents: 3000 })).toHaveLength(1)
		expect((await source.search({ query: 'carter', reference: '00H01205041', maxPriceCents: undefined })).map((i) => i.itemId)).toEqual(['A6'])
	})

	test('flux mis en cache puis rechargé après le délai', async () => {
		const { source, clock, calls } = feed([new Response(CSV), new Response('SKU;Nom;Lien\nB1;Kit nettoyage neuf;https://track.exemple.com/b1')])
		await source.search({ query: 'kit', reference: undefined, maxPriceCents: undefined })
		await source.search({ query: 'kit', reference: undefined, maxPriceCents: undefined })
		expect(calls).toHaveLength(1)
		clock.advance(361 * 60000)
		const items = await source.search({ query: 'kit', reference: undefined, maxPriceCents: undefined })
		expect(calls).toHaveLength(2)
		expect(items.map((i) => i.itemId)).toEqual(['B1'])
	})

	test('flux trop volumineux refusé, annoncé ou non', async () => {
		const big = 'x'.repeat(3000)
		const declared = feed([new Response(big, { headers: { 'content-length': '3000' } })])
		await expect(declared.source.search({ query: 'kit', reference: undefined, maxPriceCents: undefined })).rejects.toThrow('volumineux')
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(new TextEncoder().encode(big))
				controller.close()
			}
		})
		const streamed = feed([new Response(stream)])
		await expect(streamed.source.search({ query: 'kit', reference: undefined, maxPriceCents: undefined })).rejects.toThrow('volumineux')
	})

	test('erreurs réseau et HTTP', async () => {
		await expect(feed([new Response('', { status: 404 })]).source.search({ query: 'kit', reference: undefined, maxPriceCents: undefined })).rejects.toThrow('404')
		await expect(feed([new TypeError('fetch failed')]).source.search({ query: 'kit', reference: undefined, maxPriceCents: undefined })).rejects.toThrow('injoignable')
	})
})
