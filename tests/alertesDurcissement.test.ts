import { afterEach, describe, expect, test, vi } from 'vitest'
import { DEFAULT_LIMITS, type EbayConfig, type FeedConfig, loadConfig } from '../src/alerts/config'
import { digestEmail, expiryEmail } from '../src/alerts/emails'
import { formToken, handleConfirm, handleCreate } from '../src/alerts/handlers'
import { makeLinks } from '../src/alerts/links'
import { smtpOptions } from '../src/alerts/mailer'
import { type RunDeps, runAlerts } from '../src/alerts/runner'
import { EbaySource } from '../src/alerts/sources/ebay'
import { FeedSource } from '../src/alerts/sources/feed'
import { type FoundItem, type SearchQuery, type Source, SourceError } from '../src/alerts/sources/types'
import { AlertStore } from '../src/alerts/store'
import type { AlertInput } from '../src/alerts/validation'
import { Clock, DAY, FakeSource, HOUR, MemoryMailer, POSTAL, RUN_TOKEN, SECRET, SENDER, SITE, T0, formRequest, item, linkFrom, testContext, tokenOf } from './support/alertes'

const HONEYPOT = 'site_web'
const FIELDS = { email: 'lucas@example.fr', query: 'Carter Derbi Euro 3', reference: '', maxPrice: '150', consent: 'oui', [HONEYPOT]: '' }
const FEEDS_JSON = JSON.stringify([{ name: 'muc-off', url: 'https://f.exemple.com/a.csv', columns: { title: 'name', url: 'link' } }])

async function submit(s: ReturnType<typeof testContext>, fields: Record<string, string> = {}, url = `${SITE}/alertes`, ip = '203.0.113.7') {
	const token = formToken(s.ctx)
	s.clock.advance(3000)
	const request = new Request(url, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded', origin: new URL(url).origin === SITE ? SITE : new URL(url).origin },
		body: new URLSearchParams({ ...FIELDS, jeton: token, ...fields }).toString()
	})
	return handleCreate(request, ip, s.ctx)
}

function runDeps(sources: Array<Source>, overrides: Partial<RunDeps> = {}) {
	const store = overrides.store ?? new AlertStore(':memory:')
	const clock = new Clock()
	const mailer = new MemoryMailer()
	const logs: Array<string> = []
	const deps: RunDeps = { store, sources, mailer, links: makeLinks(SITE, SECRET), limits: { ...DEFAULT_LIMITS }, sender: SENDER, now: clock.now, log: (m) => logs.push(m), ...overrides }
	const activate = (extra: Partial<AlertInput> = {}, email = 'lucas@example.fr') => {
		const created = store.createPendingAlert({ email, query: 'Carter Derbi', reference: undefined, maxPriceCents: undefined, ...extra }, clock.now(), 'v1', deps.limits)
		if (!created.created) throw new Error(created.reason)
		const alert = store.activateAlert(created.alert.id, clock.now(), deps.limits.alertTtlMs)
		if (!alert) throw new Error('activation impossible')
		return alert
	}
	return { store, clock, mailer, logs, deps, activate }
}

const EBAY: EbayConfig = {
	clientId: 'client-id',
	clientSecret: 'client-secret',
	campaignId: '5338123456',
	marketplace: 'EBAY_FR',
	apiBase: 'https://api.ebay.com',
	categoryId: undefined,
	dailyBudget: 2
}

const FEED: FeedConfig = {
	name: 'muc-off',
	url: 'https://feeds.exemple.com/catalogue.csv',
	delimiter: ',',
	columns: { id: 'sku', title: 'name', url: 'link', price: 'price', image: undefined, availability: undefined },
	refreshMinutes: 360,
	maxBytes: 30 * 1024 * 1024
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('création : attaques et doublons', () => {
	test('l’en-tête Host ne change pas l’adresse des liens envoyés', async () => {
		const s = testContext()
		const view = await submit(s, {}, 'https://evil.example/alertes')
		expect(view.status).toBe(200)
		const text = s.mailer.sent[0]?.email.text ?? ''
		expect(text).not.toContain('evil.example')
		expect(new URL(linkFrom(text, '/alertes/confirmer')).origin).toBe(SITE)
	})

	test('alerte identique déjà active : réponse neutre et aucun e-mail', async () => {
		const s = testContext()
		await submit(s)
		const link = linkFrom(s.mailer.sent[0]?.email.text ?? '', '/alertes/confirmer')
		await handleConfirm(formRequest('/alertes/confirmer', { t: tokenOf(link) }), new URL(`${SITE}/alertes/confirmer`), s.ctx)
		const again = await submit(s, { query: '  carter  DERBI euro 3 ' })
		expect(again).toEqual({ state: 'sent', status: 200 })
		expect(s.mailer.sent).toHaveLength(1)
		expect(s.ctx.store.listAlerts(1)).toHaveLength(1)
		expect(s.logs.some((line) => line.includes('duplicate'))).toBe(true)
	})

	test('alerte identique en attente : la confirmation est renvoyée pour la même alerte', async () => {
		const s = testContext()
		await submit(s)
		await submit(s)
		expect(s.mailer.sent).toHaveLength(2)
		expect(s.ctx.store.listAlerts(1)).toHaveLength(1)
		const first = tokenOf(linkFrom(s.mailer.sent[0]?.email.text ?? '', '/alertes/confirmer'))
		const second = tokenOf(linkFrom(s.mailer.sent[1]?.email.text ?? '', '/alertes/confirmer'))
		expect(first.split('.')[1]).toBe(second.split('.')[1])
	})

	test('critères différents : prix ou référence distincts créent une autre alerte', async () => {
		const s = testContext()
		await submit(s)
		await submit(s, { maxPrice: '200' })
		await submit(s, { reference: '00H01205041' })
		expect(s.ctx.store.listAlerts(1)).toHaveLength(3)
	})

	test('plafond global de confirmations par heure, sans révéler la limite', async () => {
		const s = testContext({ config: { limits: { ...DEFAULT_LIMITS, maxConfirmationsPerHour: 3, ipMaxRequests: 100 } } })
		for (let i = 0; i < 5; i++) expect(await submit(s, { email: `victime${i}@example.fr` }, `${SITE}/alertes`, `198.51.100.${i}`)).toEqual({ state: 'sent', status: 200 })
		expect(s.mailer.sent).toHaveLength(3)
		expect(s.logs.filter((line) => line.includes('global_limit'))).toHaveLength(2)
		s.clock.advance(HOUR)
		await submit(s, { email: 'tard@example.fr' })
		expect(s.mailer.sent).toHaveLength(4)
	})
})

describe('mentions obligatoires des e-mails (eBay Partner Network, LCEN, CAN-SPAM)', () => {
	const urls = { manageUrl: `${SITE}/alertes/gerer?t=sub.1.0.x`, unsubscribeUrl: `${SITE}/api/alertes/desinscription?t=sub.1.0.x` }
	const ebayItem = { title: 'Carter', priceCents: 4500, currency: 'EUR', url: 'https://www.ebay.fr/itm/1', imageUrl: null, condition: null, source: 'ebay', foundAt: T0 }

	test('annonces eBay : publicité signalée, divulgation eBay, adresse postale et désinscription', () => {
		const email = digestEmail({ groups: [{ query: 'Carter', expiresAt: null, items: [ebayItem] }], extraCount: 0, now: T0, sender: SENDER, ...urls })
		for (const body of [email.text, email.html.replaceAll('&#39;', "'").replaceAll('&quot;', '"')]) {
			expect(body).toContain('Publicité')
			expect(body).toContain('En tant que partenaire eBay')
			expect(body).toContain(POSTAL)
			expect(body).toContain(urls.unsubscribeUrl)
		}
		expect(email.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
	})

	test('sans annonce eBay : pas de mention eBay, mais toujours l’adresse et l’affiliation', () => {
		const email = digestEmail({ groups: [{ query: 'Carter', expiresAt: null, items: [{ ...ebayItem, source: 'muc-off' }] }], extraCount: 0, now: T0, sender: SENDER, ...urls })
		expect(email.text).not.toContain('partenaire eBay')
		expect(email.text).toContain('liens affiliés')
		expect(email.text).toContain(POSTAL)
	})

	test('rappel d’expiration : adresse postale et désinscription', () => {
		const email = expiryEmail({ query: 'Carter', expiresAt: T0 + DAY, sender: SENDER, ...urls })
		expect(email.text).toContain(POSTAL)
		expect(email.html).toContain(urls.unsubscribeUrl)
	})

	test('l’adresse postale est obligatoire et contrôlée', () => {
		const base: Record<string, string | undefined> = Object.fromEntries([
			['ALERTS_ENABLED', 'true'],
			['ALERTS_SECRET', SECRET],
			['ALERTS_RUN_TOKEN', RUN_TOKEN],
			['SMTP_URL', 'smtps://u:p@smtp.exemple.fr:465'],
			['MAIL_FROM', 'Trouve ta pièce <alertes@trouve-ta-piece.fr>'],
			['FEEDS', FEEDS_JSON]
		])
		const reason = (address: string | undefined) => {
			const result = loadConfig({ ...base, ...Object.fromEntries([['MAIL_POSTAL_ADDRESS', address]]) })
			return result.enabled ? 'actif' : result.reason
		}
		expect(reason(undefined)).toContain('MAIL_POSTAL_ADDRESS')
		expect(reason('Nantes')).toContain('MAIL_POSTAL_ADDRESS')
		expect(reason(`${POSTAL}\r\nBcc: x@y.fr`)).toContain('MAIL_POSTAL_ADDRESS')
		expect(reason(`${POSTAL} <script>`)).toContain('MAIL_POSTAL_ADDRESS')
		expect(reason(POSTAL)).toBe('actif')
	})
})

describe('connexion SMTP', () => {
	test('TLS imposé vers un serveur distant, délais courts, aucun accès fichier ou URL', () => {
		expect(smtpOptions('smtp://alertes%40ttp.fr:mot%20de%20passe@smtp.exemple.fr')).toMatchObject({
			host: 'smtp.exemple.fr',
			port: 587,
			secure: false,
			requireTLS: true,
			auth: { user: 'alertes@ttp.fr', pass: 'mot de passe' },
			connectionTimeout: 10000,
			socketTimeout: 30000,
			disableFileAccess: true,
			disableUrlAccess: true
		})
		expect(smtpOptions('smtps://u:p@smtp.exemple.fr')).toMatchObject({ port: 465, secure: true, requireTLS: false })
		expect(smtpOptions('smtp://127.0.0.1:2525')).toMatchObject({ port: 2525, requireTLS: false, auth: undefined })
		expect(() => smtpOptions('http://smtp.exemple.fr')).toThrow()
	})
})

describe('sources : pertinence et redirections', () => {
	const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
	const summary = (id: string, title: string) => ({ itemId: `v1|${id}|0`, title, price: { value: '45.00', currency: 'EUR' }, itemAffiliateWebUrl: `https://www.ebay.fr/itm/${id}?campid=5338123456` })

	test('eBay : les annonces hors sujet sont écartées, la référence prime sur les mots', async () => {
		const replies = [
			new Response('{"access_token":"jeton-application-1234","expires_in":7200}'),
			json({ itemSummaries: [summary('1', 'Carter embrayage DERBI Senda'), summary('2', 'Phare Yamaha DT 50'), summary('3', 'Kit carters moteur Derbi'), summary('4', 'Derbi Senda complète')] }),
			json({ itemSummaries: [summary('5', 'Carter Derbi réf 00H01205041'), summary('6', 'Carter Derbi réf 00H01205099')] })
		]
		const clock = new Clock()
		const source = new EbaySource(EBAY, {
			fetch: async () => {
				const next = replies.shift()
				if (!next) throw new Error('appel inattendu')
				return next
			},
			now: clock.now,
			takeCall: () => true
		})
		const words = await source.search({ query: 'carter derbi', reference: undefined, maxPriceCents: undefined })
		expect(words.map((i) => i.itemId)).toEqual(['v1|1|0', 'v1|3|0'])
		const reference = await source.search({ query: 'carter derbi', reference: '00H-01205041', maxPriceCents: undefined })
		expect(reference.map((i) => i.itemId)).toEqual(['v1|5|0'])
	})

	function feedWith(responses: Array<Response>) {
		const urls: Array<string> = []
		const clock = new Clock()
		const source = new FeedSource(FEED, {
			fetch: async (url, init) => {
				urls.push(url)
				expect(init?.redirect).toBe('manual')
				const next = responses.shift()
				if (!next) throw new Error('appel inattendu')
				return next
			},
			now: clock.now
		})
		return { source, urls }
	}
	const redirect = (location: string) => new Response(null, { status: 302, headers: { location } })
	const csv = 'sku,name,link,price\nA1,Carter Derbi,https://shop.exemple.com/a1,45.00\n'

	test('flux : redirection https suivie, adresse relative résolue', async () => {
		const { source, urls } = feedWith([redirect('https://cdn.exemple.com/v2.csv'), redirect('/v3.csv'), new Response(csv)])
		expect(await source.search({ query: 'carter', reference: undefined, maxPriceCents: undefined })).toHaveLength(1)
		expect(urls).toEqual([FEED.url, 'https://cdn.exemple.com/v2.csv', 'https://cdn.exemple.com/v3.csv'])
	})

	test('flux : redirection vers http, fichier local ou en boucle refusée', async () => {
		for (const location of ['http://cdn.exemple.com/a.csv', 'file:///etc/passwd', 'https://user:mdp@cdn.exemple.com/a.csv']) {
			const { source } = feedWith([redirect(location)])
			await expect(source.search({ query: 'carter', reference: undefined, maxPriceCents: undefined })).rejects.toThrow(SourceError)
		}
		const loop = feedWith(Array.from({ length: 5 }, () => redirect('https://cdn.exemple.com/boucle.csv')))
		await expect(loop.source.search({ query: 'carter', reference: undefined, maxPriceCents: undefined })).rejects.toThrow('trop de redirections')
	})

	test('flux de 50 000 lignes et 200 alertes : recherche rapide', async () => {
		const lines = ['sku,name,link,price']
		for (let i = 0; i < 50000; i++) lines.push(`P${i},"Pièce ${i % 7 === 0 ? 'Carter' : 'Cylindre'} Derbi modèle ${i}",https://shop.exemple.com/p${i},${(i % 500) + 1}.00`)
		const { source } = feedWith([new Response(lines.join('\n'))])
		const started = performance.now()
		await source.search({ query: 'carter derbi', reference: undefined, maxPriceCents: undefined })
		const loaded = performance.now()
		let total = 0
		for (let i = 0; i < 200; i++) total += (await source.search({ query: `carter derbi ${i * 7}`, reference: undefined, maxPriceCents: 30000 })).length
		const searched = performance.now() - loaded
		expect(total).toBeGreaterThan(0)
		expect(loaded - started).toBeLessThan(5000)
		expect(searched).toBeLessThan(5000)
	})
})

class CountingSource implements Source {
	readonly name: string
	readonly queries: Array<SearchQuery> = []
	items: Array<FoundItem> = []
	delayMs = 0
	failNext = false
	private readonly clock: Clock

	constructor(name: string, clock: Clock) {
		this.name = name
		this.clock = clock
	}

	async search(query: SearchQuery) {
		this.queries.push(query)
		this.clock.advance(this.delayMs)
		await new Promise((resolve) => setTimeout(resolve, 1))
		if (this.failNext) {
			this.failNext = false
			throw new SourceError('panne passagère', { retryable: true })
		}
		return this.items.filter((i) => query.maxPriceCents === undefined || (i.priceCents ?? 0) <= query.maxPriceCents)
	}
}

describe('passage : quota, durée et première vérification', () => {
	test('une même recherche n’est faite qu’une fois par passage', async () => {
		const clock = new Clock()
		const ebay = new CountingSource('ebay', clock)
		const env = runDeps([ebay], { now: clock.now })
		env.activate({}, 'a@example.fr')
		env.activate({ query: 'carter  DERBI' }, 'b@example.fr')
		env.activate({}, 'c@example.fr')
		env.activate({ maxPriceCents: 5000 }, 'd@example.fr')
		ebay.items = [item('1')]
		const summary = await runAlerts(env.deps)
		expect(summary.checked).toBe(4)
		expect(ebay.queries).toHaveLength(2)
		expect(env.mailer.sent).toHaveLength(4)
	})

	test('la durée d’un passage est bornée, le reste est traité au suivant', async () => {
		const clock = new Clock()
		const ebay = new CountingSource('ebay', clock)
		ebay.delayMs = 20000
		const env = runDeps([ebay], { now: clock.now })
		env.deps.limits = { ...env.deps.limits, runConcurrency: 1, runBudgetMs: 50000 }
		for (let i = 0; i < 6; i++) env.activate({ query: `Pièce ${i}` }, `motard${i}@example.fr`)
		const first = await runAlerts(env.deps)
		expect(first.checked).toBe(3)
		expect(first.deferred).toBe(3)
		clock.advance(60000)
		const second = await runAlerts(env.deps)
		expect(second.checked).toBe(3)
		expect(second.deferred).toBe(0)
	})

	test('en parallèle, le quota eBay quotidien n’est jamais dépassé', async () => {
		const store = new AlertStore(':memory:')
		const clock = new Clock()
		let searches = 0
		const source = new EbaySource(EBAY, {
			fetch: async (url) => {
				if (url.includes('/oauth2/token')) return new Response('{"access_token":"jeton-application-1234","expires_in":7200}')
				searches++
				await new Promise((resolve) => setTimeout(resolve, 5))
				return new Response('{"itemSummaries":[]}')
			},
			now: clock.now,
			takeCall: () => store.takeApiCall('ebay', clock.now(), EBAY.dailyBudget)
		})
		const env = runDeps([source], { store, now: clock.now })
		env.deps.limits = { ...env.deps.limits, runConcurrency: 8 }
		for (let i = 0; i < 10; i++) env.activate({ query: `Pièce rare ${i}` }, `motard${i}@example.fr`)
		const summary = await runAlerts(env.deps)
		expect(searches).toBe(2)
		expect(store.apiCalls('ebay', clock.now())).toBe(2)
		expect(summary.budgetExhausted).toEqual(['ebay'])
	})

	test('source en panne à la première vérification : les autres sources partent, puis une seule salve limitée', async () => {
		const clock = new Clock()
		const ebay = new CountingSource('ebay', clock)
		const feed = new FakeSource('muc-off')
		feed.items = [item('f1', { source: 'muc-off', title: 'Carter Derbi boutique' })]
		const env = runDeps([ebay, feed], { now: clock.now })
		env.activate()
		ebay.failNext = true
		ebay.items = Array.from({ length: 15 }, (_, i) => item(`e${i}`))
		const first = await runAlerts(env.deps)
		expect(first.checked).toBe(0)
		expect(env.mailer.sent).toHaveLength(1)
		expect(env.mailer.sent[0]?.email.text).toContain('Carter Derbi boutique')
		clock.advance(15 * 60000)
		const second = await runAlerts(env.deps)
		expect(second.checked).toBe(1)
		expect(env.mailer.sent).toHaveLength(2)
		expect(env.mailer.sent[1]?.email.text.match(/https:\/\/www\.ebay\.fr\/itm\//g)).toHaveLength(10)
		for (let i = 0; i < 4; i++) {
			clock.advance(HOUR)
			await runAlerts(env.deps)
		}
		expect(env.mailer.sent).toHaveLength(2)
	})

	test('base illisible au démarrage : service coupé proprement, journalisé, puis retenté', async () => {
		vi.resetModules()
		const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const previous = { ...process.env }
		Object.assign(
			process.env,
			Object.fromEntries([
				['ALERTS_ENABLED', 'true'],
				['ALERTS_SECRET', SECRET],
				['ALERTS_RUN_TOKEN', RUN_TOKEN],
				['ALERTS_DB_PATH', '/dev/null/alertes.sqlite'],
				['SMTP_URL', 'smtp://127.0.0.1:2525'],
				['MAIL_FROM', 'Trouve ta pièce <alertes@trouve-ta-piece.fr>'],
				['MAIL_POSTAL_ADDRESS', POSTAL],
				['FEEDS', FEEDS_JSON]
			])
		)
		try {
			const { getAlertsContext } = await import('../src/alerts/service')
			expect(getAlertsContext()).toBeUndefined()
			expect(getAlertsContext()).toBeUndefined()
			expect(errors).toHaveBeenCalledTimes(1)
			expect(String(errors.mock.calls[0]?.[0])).toContain('démarrage impossible')
			expect(String(errors.mock.calls[0]?.[0])).not.toContain(SECRET)
		} finally {
			process.env = previous
		}
	})
})
