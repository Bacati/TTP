import { type AlertsConfig, DEFAULT_LIMITS } from '../../src/alerts/config'
import type { RenderedEmail } from '../../src/alerts/emails'
import type { Mailer } from '../../src/alerts/mailer'
import { type ContextOverrides, buildContext } from '../../src/alerts/service'
import type { FoundItem, SearchQuery, Source } from '../../src/alerts/sources/types'

export const SECRET = 'secret-de-test-0123456789-abcdefghijklmnop'
export const RUN_TOKEN = 'jeton-execution-0123456789-abcdefghijklmnop'
export const SITE = 'https://trouve-ta-piece.fr'
export const T0 = Date.UTC(2026, 9, 7, 10, 0, 0)
export const HOUR = 3600000
export const DAY = 24 * HOUR
export const POSTAL = 'Trouve ta pièce, 26 boulevard Robert Schuman, 44300 Nantes'
export const SENDER = { postalAddress: POSTAL }

export function testConfig(overrides: Partial<AlertsConfig> = {}): AlertsConfig {
	return {
		siteUrl: SITE,
		secret: SECRET,
		runToken: RUN_TOKEN,
		dbPath: ':memory:',
		smtpUrl: 'smtp://127.0.0.1:2525',
		mailFrom: 'Trouve ta pièce <alertes@trouve-ta-piece.fr>',
		postalAddress: POSTAL,
		trustProxy: false,
		ebay: undefined,
		feeds: [],
		limits: { ...DEFAULT_LIMITS },
		...overrides
	}
}

export class MemoryMailer implements Mailer {
	readonly sent: Array<{ to: string; email: RenderedEmail }> = []
	failing = false

	async send(to: string, email: RenderedEmail) {
		if (this.failing) throw new Error('SMTP indisponible')
		this.sent.push({ to, email })
	}
}

export class FakeSource implements Source {
	readonly name: string
	items: Array<FoundItem> = []
	error: Error | undefined
	readonly queries: Array<SearchQuery> = []

	constructor(name = 'ebay') {
		this.name = name
	}

	async search(query: SearchQuery) {
		this.queries.push(query)
		if (this.error) throw this.error
		return this.items.filter((item) => query.maxPriceCents === undefined || (item.priceCents ?? 0) <= query.maxPriceCents)
	}
}

export function item(itemId: string, extra: Partial<FoundItem> = {}): FoundItem {
	return {
		source: 'ebay',
		itemId,
		title: `Carter Derbi ${itemId}`,
		priceCents: 4500,
		currency: 'EUR',
		url: `https://www.ebay.fr/itm/${itemId}?campid=5338000000`,
		imageUrl: `https://i.ebayimg.com/images/${itemId}.jpg`,
		condition: 'Occasion',
		...extra
	}
}

export class Clock {
	value = T0
	now = () => this.value
	advance(ms: number) {
		this.value += ms
	}
}

export function testContext(overrides: ContextOverrides & { config?: Partial<AlertsConfig> } = {}) {
	const clock = new Clock()
	const { config, mailer: given, ...rest } = overrides
	const mailer = given instanceof MemoryMailer ? given : new MemoryMailer()
	const logs: Array<string> = []
	const ctx = buildContext(testConfig(config), { mailer, now: clock.now, log: (message) => logs.push(message), ...rest })
	return { ctx, clock, mailer, logs }
}

export function formRequest(path: string, fields: Record<string, string>, headers: Record<string, string> = { origin: SITE }): Request {
	return new Request(`${SITE}${path}`, {
		method: 'POST',
		headers: new Headers([['content-type', 'application/x-www-form-urlencoded'], ...Object.entries(headers)]),
		body: new URLSearchParams(fields).toString()
	})
}

export function linkFrom(text: string, path: string): string {
	const match = new RegExp(`${SITE.replace(/\./g, '\\.')}${path}\\?t=[A-Za-z0-9._-]+`).exec(text)
	if (!match) throw new Error(`lien ${path} introuvable`)
	return match[0]
}

export function tokenOf(link: string): string {
	return new URL(link).searchParams.get('t') ?? ''
}
