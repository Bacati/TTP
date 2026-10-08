import { createHash } from 'node:crypto'
import { type FeedConfig, isAllowedFetchUrl } from '../config'
import { csvRecords } from '../csv'
import { type PreparedTitle, compileMatcher, isHttpsUrl, normalizeText, parsePriceCents, prepareTitle, stripControl } from '../text'
import { type FetchLike, type FoundItem, type SearchQuery, type Source, SourceError, withinPrice } from './types'

const TIMEOUT_MS = 30000
const MAX_REDIRECTS = 3
const UNAVAILABLE = /\b(out of stock|rupture|indisponible|epuise|unavailable|false|no|non|0)\b/

export interface FeedDeps {
	fetch: FetchLike
	now: () => number
}

async function readLimited(response: Response, maxBytes: number): Promise<string> {
	const declared = Number(response.headers.get('content-length'))
	if (Number.isFinite(declared) && declared > maxBytes) throw new SourceError('flux trop volumineux')
	if (!response.body) return ''
	const reader = response.body.getReader()
	const chunks: Array<Uint8Array> = []
	let total = 0
	for (;;) {
		const { done, value } = await reader.read()
		if (done) break
		total += value.byteLength
		if (total > maxBytes) {
			await reader.cancel()
			throw new SourceError('flux trop volumineux')
		}
		chunks.push(value)
	}
	return new TextDecoder('utf-8').decode(Buffer.concat(chunks))
}

export function recordToItem(feed: FeedConfig, record: Record<string, string>): FoundItem | undefined {
	const { columns } = feed
	const title = stripControl(record[columns.title] ?? '').slice(0, 200)
	const url = record[columns.url] ?? ''
	if (!(title && isHttpsUrl(url))) return undefined
	const availability = columns.availability ? normalizeText(record[columns.availability] ?? '') : ''
	if (availability && UNAVAILABLE.test(availability)) return undefined
	const rawId = columns.id ? (record[columns.id] ?? '') : ''
	const itemId = /^[\w.-]{1,64}$/.test(rawId) ? rawId : createHash('sha256').update(url).digest('hex').slice(0, 24)
	const image = columns.image ? record[columns.image] : undefined
	return {
		source: feed.name,
		itemId,
		title,
		priceCents: columns.price ? parsePriceCents(record[columns.price] ?? '') : undefined,
		currency: 'EUR',
		url,
		imageUrl: isHttpsUrl(image) ? image : undefined,
		condition: undefined
	}
}

interface IndexedItem {
	item: FoundItem
	title: PreparedTitle
}

export class FeedSource implements Source {
	readonly name: string
	private items: Array<IndexedItem> | undefined
	private loadedAt = 0
	private readonly feed: FeedConfig
	private readonly deps: FeedDeps

	constructor(feed: FeedConfig, deps: FeedDeps) {
		this.feed = feed
		this.deps = deps
		this.name = feed.name
	}

	private async download(): Promise<Response> {
		let url = this.feed.url
		for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
			let response: Response
			try {
				response = await this.deps.fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) })
			} catch (error) {
				throw new SourceError(`flux ${this.feed.name} injoignable : ${(error as Error).name}`, { retryable: true })
			}
			const location = response.status >= 300 && response.status < 400 ? response.headers.get('location') : null
			if (location === null) return response
			const next = URL.canParse(location, url) ? new URL(location, url).href : ''
			if (!isAllowedFetchUrl(next)) throw new SourceError(`flux ${this.feed.name} : redirection non sécurisée refusée`)
			url = next
		}
		throw new SourceError(`flux ${this.feed.name} : trop de redirections`)
	}

	private async load(): Promise<Array<IndexedItem>> {
		const fresh = this.items && this.deps.now() - this.loadedAt < this.feed.refreshMinutes * 60000
		if (fresh && this.items) return this.items
		const response = await this.download()
		if (!response.ok) throw new SourceError(`flux ${this.feed.name} en échec (${response.status})`, { retryable: response.status >= 500 })
		const text = await readLimited(response, this.feed.maxBytes)
		const items = csvRecords(text, this.feed.delimiter)
			.map((record) => recordToItem(this.feed, record))
			.filter((item): item is FoundItem => item !== undefined)
			.map((item) => ({ item, title: prepareTitle(item.title) }))
		this.items = items
		this.loadedAt = this.deps.now()
		return items
	}

	async search(query: SearchQuery): Promise<Array<FoundItem>> {
		const items = await this.load()
		const matches = compileMatcher(query.query, query.reference)
		const seen = new Set<string>()
		const found: Array<FoundItem> = []
		for (const { item, title } of items) {
			if (seen.has(item.itemId) || !withinPrice(item, query.maxPriceCents) || !matches(title)) continue
			seen.add(item.itemId)
			found.push(item)
		}
		return found
	}
}
