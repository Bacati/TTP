import { stripControl } from './text'

export interface EbayConfig {
	clientId: string
	clientSecret: string
	campaignId: string
	marketplace: string
	apiBase: string
	categoryId: string | undefined
	dailyBudget: number
}

export interface FeedColumns {
	id: string | undefined
	title: string
	url: string
	price: string | undefined
	image: string | undefined
	availability: string | undefined
}

export interface FeedConfig {
	name: string
	url: string
	delimiter: string
	columns: FeedColumns
	refreshMinutes: number
	maxBytes: number
}

export interface AlertLimits {
	maxActiveAlertsPerEmail: number
	maxConfirmationsPerEmailPerDay: number
	maxConfirmationsPerHour: number
	pendingTtlMs: number
	alertTtlMs: number
	expiryReminderMs: number
	checkIntervalMs: number
	maxAlertsPerRun: number
	maxItemsPerEmail: number
	maxEmailsPerSubscriberPerDay: number
	itemFreshnessMs: number
	formMinDelayMs: number
	formMaxAgeMs: number
	ipWindowMs: number
	ipMaxRequests: number
	runLockMs: number
	runBudgetMs: number
	runConcurrency: number
}

export interface AlertsConfig {
	siteUrl: string
	secret: string
	runToken: string
	dbPath: string
	smtpUrl: string
	mailFrom: string
	postalAddress: string
	trustProxy: boolean
	ebay: EbayConfig | undefined
	feeds: Array<FeedConfig>
	limits: AlertLimits
}

export type ConfigResult = { enabled: true; config: AlertsConfig } | { enabled: false; reason: string }

const HOUR = 3600000
const DAY = 24 * HOUR

export const DEFAULT_LIMITS: AlertLimits = {
	maxActiveAlertsPerEmail: 5,
	maxConfirmationsPerEmailPerDay: 3,
	maxConfirmationsPerHour: 100,
	pendingTtlMs: 48 * HOUR,
	alertTtlMs: 180 * DAY,
	expiryReminderMs: 7 * DAY,
	checkIntervalMs: HOUR,
	maxAlertsPerRun: 100,
	maxItemsPerEmail: 10,
	maxEmailsPerSubscriberPerDay: 6,
	itemFreshnessMs: 6 * HOUR,
	formMinDelayMs: 2000,
	formMaxAgeMs: 2 * HOUR,
	ipWindowMs: 15 * 60000,
	ipMaxRequests: 10,
	runLockMs: 15 * 60000,
	runBudgetMs: 50000,
	runConcurrency: 4
}

export const CONSENT_VERSION = '2026-10-07'

export const CONSENT_TEXT = 'J’accepte de recevoir par e-mail les annonces correspondant à mon alerte. Les liens sont affiliés. Je peux me désinscrire à tout moment depuis chaque e-mail.'

type Env = Record<string, string | undefined>

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export function isAllowedBaseUrl(value: string): boolean {
	try {
		const url = new URL(value)
		if (url.username || url.password || url.search || url.hash) return false
		if (url.protocol === 'https:') return true
		return url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname)
	} catch {
		return false
	}
}

export function isAllowedFetchUrl(value: string): boolean {
	try {
		const url = new URL(value)
		if (url.username || url.password) return false
		if (url.protocol === 'https:') return true
		return url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname)
	} catch {
		return false
	}
}

const trimSlash = (value: string) => value.replace(/\/+$/, '')

function positiveInt(value: string | undefined, fallback: number, max: number): number {
	if (value === undefined || value === '') return fallback
	if (!/^\d{1,9}$/.test(value)) return Number.NaN
	const parsed = Number(value)
	return parsed >= 1 && parsed <= max ? parsed : Number.NaN
}

function parseEbay(env: Env): EbayConfig | string | undefined {
	if (env.EBAY_ENABLED !== 'true') return undefined
	const clientId = env.EBAY_CLIENT_ID ?? ''
	const clientSecret = env.EBAY_CLIENT_SECRET ?? ''
	const campaignId = env.EBAY_CAMPAIGN_ID ?? ''
	const marketplace = env.EBAY_MARKETPLACE ?? 'EBAY_FR'
	const apiBase = trimSlash(env.EBAY_API_BASE ?? 'https://api.ebay.com')
	const categoryId = env.EBAY_CATEGORY_ID || undefined
	const dailyBudget = positiveInt(env.EBAY_DAILY_BUDGET, 4000, 5000)
	if (!(/^[\w.-]{4,200}$/.test(clientId) && /^[\w.-]{4,200}$/.test(clientSecret))) return 'EBAY_CLIENT_ID ou EBAY_CLIENT_SECRET invalide'
	if (!/^\d{10}$/.test(campaignId)) return 'EBAY_CAMPAIGN_ID doit contenir 10 chiffres'
	if (!/^EBAY_[A-Z]{2}$/.test(marketplace)) return 'EBAY_MARKETPLACE invalide'
	if (!isAllowedBaseUrl(apiBase)) return 'EBAY_API_BASE doit être une URL https'
	if (categoryId !== undefined && !/^\d{1,12}$/.test(categoryId)) return 'EBAY_CATEGORY_ID invalide'
	if (Number.isNaN(dailyBudget)) return 'EBAY_DAILY_BUDGET doit être compris entre 1 et 5000'
	return { clientId, clientSecret, campaignId, marketplace, apiBase, categoryId, dailyBudget }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined
}

const optionalColumn = (value: unknown) => (typeof value === 'string' && value.length > 0 && value.length <= 100 ? value : undefined)

function parseFeed(raw: unknown, index: number): FeedConfig | string {
	const entry = asRecord(raw)
	const columns = asRecord(entry?.columns)
	if (!(entry && columns)) return `FEEDS[${index}] doit contenir un objet columns`
	const name = typeof entry.name === 'string' ? entry.name : ''
	const url = typeof entry.url === 'string' ? entry.url : ''
	const delimiter = typeof entry.delimiter === 'string' ? entry.delimiter : ','
	const title = optionalColumn(columns.title)
	const link = optionalColumn(columns.url)
	if (!/^[a-z0-9-]{2,30}$/.test(name) || name === 'ebay') return `FEEDS[${index}].name invalide`
	if (!isAllowedFetchUrl(url)) return `FEEDS[${index}].url doit être en https`
	if (![',', ';', '\t', '|'].includes(delimiter)) return `FEEDS[${index}].delimiter invalide`
	if (!(title && link)) return `FEEDS[${index}].columns doit préciser title et url`
	const refreshMinutes = typeof entry.refreshMinutes === 'number' && entry.refreshMinutes >= 15 && entry.refreshMinutes <= 10080 ? entry.refreshMinutes : 360
	return {
		name,
		url,
		delimiter,
		columns: { id: optionalColumn(columns.id), title, url: link, price: optionalColumn(columns.price), image: optionalColumn(columns.image), availability: optionalColumn(columns.availability) },
		refreshMinutes,
		maxBytes: 30 * 1024 * 1024
	}
}

function parseFeeds(value: string | undefined): Array<FeedConfig> | string {
	if (!value) return []
	let raw: unknown
	try {
		raw = JSON.parse(value)
	} catch {
		return 'FEEDS doit être un tableau JSON'
	}
	if (!Array.isArray(raw) || raw.length > 20) return 'FEEDS doit être un tableau JSON de 20 flux maximum'
	const feeds: Array<FeedConfig> = []
	for (const [index, entry] of raw.entries()) {
		const feed = parseFeed(entry, index)
		if (typeof feed === 'string') return feed
		if (feeds.some((f) => f.name === feed.name)) return `FEEDS[${index}].name est en double`
		feeds.push(feed)
	}
	return feeds
}

function parseCore(env: Env): Omit<AlertsConfig, 'ebay' | 'feeds' | 'limits'> | string {
	const siteUrl = trimSlash(env.SITE_URL ?? 'https://trouve-ta-piece.fr')
	const secret = env.ALERTS_SECRET ?? ''
	const runToken = env.ALERTS_RUN_TOKEN ?? ''
	const smtpUrl = env.SMTP_URL ?? ''
	const mailFrom = env.MAIL_FROM ?? ''
	const postalAddress = (env.MAIL_POSTAL_ADDRESS ?? '').trim()
	if (!isAllowedBaseUrl(siteUrl)) return 'SITE_URL doit être une URL https'
	if (secret.length < 32) return 'ALERTS_SECRET doit faire au moins 32 caractères'
	if (runToken.length < 32 || runToken === secret) return 'ALERTS_RUN_TOKEN doit faire au moins 32 caractères et différer de ALERTS_SECRET'
	if (!/^smtps?:\/\/[^\s]+$/.test(smtpUrl)) return 'SMTP_URL doit commencer par smtp:// ou smtps://'
	if (!/^[^\r\n<>]*<?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/.test(mailFrom)) return 'MAIL_FROM invalide'
	if (postalAddress.length < 10 || postalAddress.length > 200 || stripControl(postalAddress) !== postalAddress || /[<>]/.test(postalAddress))
		return 'MAIL_POSTAL_ADDRESS doit contenir l’adresse postale de l’expéditeur (10 à 200 caractères)'
	return { siteUrl, secret, runToken, dbPath: env.ALERTS_DB_PATH || './data/alertes.sqlite', smtpUrl, mailFrom, postalAddress, trustProxy: env.TRUST_PROXY === 'true' }
}

export function loadConfig(env: Env, limits: AlertLimits = DEFAULT_LIMITS): ConfigResult {
	if (env.ALERTS_ENABLED !== 'true') return { enabled: false, reason: 'ALERTS_ENABLED n’est pas à true' }
	const core = parseCore(env)
	if (typeof core === 'string') return { enabled: false, reason: core }
	const ebay = parseEbay(env)
	if (typeof ebay === 'string') return { enabled: false, reason: ebay }
	const feeds = parseFeeds(env.FEEDS)
	if (typeof feeds === 'string') return { enabled: false, reason: feeds }
	if (!ebay && feeds.length === 0) return { enabled: false, reason: 'aucune source activée (EBAY_ENABLED ou FEEDS)' }
	return { enabled: true, config: { ...core, ebay, feeds, limits } }
}
