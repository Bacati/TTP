import { type AlertsConfig, loadConfig } from './config'
import type { AlertsContext } from './handlers'
import { RateLimiter } from './http'
import { makeLinks } from './links'
import { type Mailer, createSmtpMailer } from './mailer'
import { runAlerts } from './runner'
import { EbaySource } from './sources/ebay'
import { FeedSource } from './sources/feed'
import type { FetchLike, Source } from './sources/types'
import { AlertStore } from './store'

export interface ContextOverrides {
	mailer?: Mailer
	fetch?: FetchLike
	now?: () => number
	log?: (message: string) => void
}

export function buildContext(config: AlertsConfig, overrides: ContextOverrides = {}): AlertsContext {
	const now = overrides.now ?? Date.now
	const log = overrides.log ?? ((message: string) => console.log(message))
	const fetcher: FetchLike = overrides.fetch ?? ((input, init) => fetch(input, init))
	const store = new AlertStore(config.dbPath)
	const mailer = overrides.mailer ?? createSmtpMailer(config.smtpUrl, config.mailFrom)
	const links = makeLinks(config.siteUrl, config.secret)
	const sources: Array<Source> = []
	if (config.ebay) {
		const budget = config.ebay.dailyBudget
		sources.push(new EbaySource(config.ebay, { fetch: fetcher, now, takeCall: () => store.takeApiCall('ebay', now(), budget) }))
	}
	for (const feed of config.feeds) sources.push(new FeedSource(feed, { fetch: fetcher, now }))
	const limiter = new RateLimiter(config.limits.ipWindowMs, config.limits.ipMaxRequests)
	return {
		config,
		store,
		mailer,
		links,
		limiter,
		now,
		log,
		run: () => runAlerts({ store, sources, mailer, links, limits: config.limits, sender: { postalAddress: config.postalAddress }, now, log })
	}
}

const RETRY_AFTER_FAILURE_MS = 60000

let cached: { context: AlertsContext } | { reason: string } | { failedAt: number } | undefined

export function getAlertsContext(): AlertsContext | undefined {
	if (cached && 'failedAt' in cached && Date.now() - cached.failedAt >= RETRY_AFTER_FAILURE_MS) cached = undefined
	if (!cached) {
		const result = loadConfig(process.env)
		if (result.enabled) {
			try {
				cached = { context: buildContext(result.config) }
			} catch (error) {
				cached = { failedAt: Date.now() }
				console.error(`[alertes] démarrage impossible : ${(error as Error).message}`)
			}
		} else {
			cached = { reason: result.reason }
			if (process.env.ALERTS_ENABLED === 'true') console.warn(`[alertes] désactivées : ${result.reason}`)
		}
	}
	return 'context' in cached ? cached.context : undefined
}
