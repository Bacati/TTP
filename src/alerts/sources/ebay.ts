import type { EbayConfig } from '../config'
import { compileMatcher, isHttpsUrl, parsePriceCents, prepareTitle, stripControl } from '../text'
import { type FetchLike, type FoundItem, type SearchQuery, type Source, SourceError, withinPrice } from './types'

const SCOPE = 'https://api.ebay.com/oauth/api_scope'
const EBAY_HOST = /(^|\.)ebay\.(com|fr|de|it|es|co\.uk|be|ch|at|nl|ie|ca|com\.au)$/
const EBAY_IMAGE_HOST = /(^|\.)ebayimg\.com$/
const TIMEOUT_MS = 15000

export interface EbayDeps {
	fetch: FetchLike
	now: () => number
	takeCall: () => boolean
}

interface EbayToken {
	value: string
	expiresAt: number
}

type Json = Record<string, unknown>

const asObject = (value: unknown): Json | undefined => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : undefined)

export function buildSearchUrl(config: EbayConfig, query: SearchQuery): string {
	const keywords = stripControl(query.reference ?? query.query).slice(0, 100)
	const filters = ['deliveryCountry:FR']
	if (query.maxPriceCents !== undefined) filters.push(`price:[..${(query.maxPriceCents / 100).toFixed(2)}]`, 'priceCurrency:EUR')
	const params = new URLSearchParams({ q: keywords, sort: 'newlyListed', limit: '50', filter: filters.join(',') })
	if (config.categoryId) params.set('category_ids', config.categoryId)
	return `${config.apiBase}/buy/browse/v1/item_summary/search?${params.toString()}`
}

export function parseItem(raw: unknown): FoundItem | undefined {
	const item = asObject(raw)
	if (!item) return undefined
	const itemId = typeof item.itemId === 'string' && /^[\w|.-]{1,64}$/.test(item.itemId) ? item.itemId : undefined
	const title = typeof item.title === 'string' ? stripControl(item.title).slice(0, 200) : ''
	const url = isHttpsUrl(item.itemAffiliateWebUrl, EBAY_HOST) ? item.itemAffiliateWebUrl : isHttpsUrl(item.itemWebUrl, EBAY_HOST) ? item.itemWebUrl : undefined
	if (!(itemId && title && url)) return undefined
	const price = asObject(item.price)
	const priceCents = typeof price?.value === 'string' ? parsePriceCents(price.value) : undefined
	const currency = typeof price?.currency === 'string' && /^[A-Z]{3}$/.test(price.currency) ? price.currency : 'EUR'
	const imageUrl = asObject(item.image)?.imageUrl
	const condition = typeof item.condition === 'string' ? stripControl(item.condition).slice(0, 60) : undefined
	return {
		source: 'ebay',
		itemId,
		title,
		priceCents,
		currency,
		url,
		imageUrl: isHttpsUrl(imageUrl, EBAY_IMAGE_HOST) ? imageUrl : undefined,
		condition: condition || undefined
	}
}

export class EbaySource implements Source {
	readonly name = 'ebay'
	private token: EbayToken | undefined
	private readonly config: EbayConfig
	private readonly deps: EbayDeps

	constructor(config: EbayConfig, deps: EbayDeps) {
		this.config = config
		this.deps = deps
	}

	private async request(url: string, init: RequestInit): Promise<Response> {
		try {
			return await this.deps.fetch(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(TIMEOUT_MS) })
		} catch (error) {
			throw new SourceError(`eBay injoignable : ${(error as Error).name}`, { retryable: true })
		}
	}

	private async getToken(force: boolean): Promise<string> {
		if (!force && this.token && this.token.expiresAt > this.deps.now()) return this.token.value
		const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
		const response = await this.request(`${this.config.apiBase}/identity/v1/oauth2/token`, {
			method: 'POST',
			headers: [
				['Authorization', `Basic ${credentials}`],
				['Content-Type', 'application/x-www-form-urlencoded'],
				['Accept', 'application/json']
			],
			body: new URLSearchParams([
				['grant_type', 'client_credentials'],
				['scope', SCOPE]
			]).toString()
		})
		if (!response.ok) throw new SourceError(`jeton eBay refusé (${response.status})`, { retryable: response.status >= 500 })
		const body = asObject(await response.json().catch(() => undefined))
		const value = body?.access_token
		const expiresIn = Number(body?.expires_in)
		if (typeof value !== 'string' || value.length < 10 || !Number.isFinite(expiresIn) || expiresIn < 60) throw new SourceError('réponse de jeton eBay invalide')
		this.token = { value, expiresAt: this.deps.now() + (expiresIn - 300) * 1000 }
		return value
	}

	private async callSearch(url: string, token: string): Promise<Response> {
		if (!this.deps.takeCall()) throw new SourceError('quota quotidien eBay atteint', { budgetExhausted: true })
		return this.request(url, {
			method: 'GET',
			headers: [
				['Authorization', `Bearer ${token}`],
				['Accept', 'application/json'],
				['Accept-Language', 'fr-FR'],
				['X-EBAY-C-MARKETPLACE-ID', this.config.marketplace],
				['X-EBAY-C-ENDUSERCTX', `affiliateCampaignId=${this.config.campaignId},affiliateReferenceId=alertes`]
			]
		})
	}

	async search(query: SearchQuery): Promise<Array<FoundItem>> {
		const url = buildSearchUrl(this.config, query)
		let response = await this.callSearch(url, await this.getToken(false))
		if (response.status === 401) response = await this.callSearch(url, await this.getToken(true))
		if (response.status === 429) throw new SourceError('eBay limite les appels (429)', { retryable: true })
		if (!response.ok) throw new SourceError(`recherche eBay en échec (${response.status})`, { retryable: response.status >= 500 })
		const body = asObject(await response.json().catch(() => undefined))
		if (!body) throw new SourceError('réponse eBay illisible', { retryable: true })
		const raw = Array.isArray(body.itemSummaries) ? body.itemSummaries : []
		const matches = compileMatcher(query.query, query.reference)
		const seen = new Set<string>()
		const items: Array<FoundItem> = []
		for (const entry of raw) {
			const item = parseItem(entry)
			if (!item || seen.has(item.itemId)) continue
			if (!withinPrice(item, query.maxPriceCents)) continue
			if (!matches(prepareTitle(item.title))) continue
			seen.add(item.itemId)
			items.push(item)
		}
		return items
	}
}
