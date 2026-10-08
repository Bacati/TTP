import type { AlertLimits } from './config'
import { type DigestGroup, type Sender, digestEmail, expiryEmail } from './emails'
import type { Links } from './links'
import type { Mailer } from './mailer'
import { type FoundItem, type SearchQuery, type Source, SourceError } from './sources/types'
import type { AlertStore, PendingMatch, StoredAlert } from './store'
import { compactReference, normalizeText } from './text'

export interface RunDeps {
	store: AlertStore
	sources: Array<Source>
	mailer: Mailer
	links: Links
	limits: AlertLimits
	sender: Sender
	now: () => number
	log: (message: string) => void
}

export interface RunSummary {
	status: 'ok' | 'busy'
	checked: number
	deferred: number
	newMatches: number
	staleDiscarded: number
	emailsSent: number
	emailFailures: number
	remindersSent: number
	sourceErrors: Record<string, number>
	budgetExhausted: Array<string>
	cleanup: { pending: number; expired: number; subscribers: number }
}

const DAY = 86400000

function emptySummary(status: RunSummary['status']): RunSummary {
	return {
		status,
		checked: 0,
		deferred: 0,
		newMatches: 0,
		staleDiscarded: 0,
		emailsSent: 0,
		emailFailures: 0,
		remindersSent: 0,
		sourceErrors: {},
		budgetExhausted: [],
		cleanup: { pending: 0, expired: 0, subscribers: 0 }
	}
}

const searchKey = (source: Source, query: SearchQuery) => [source.name, normalizeText(query.query), compactReference(query.reference ?? ''), String(query.maxPriceCents ?? '')].join('\u0000')

async function checkAlerts(deps: RunDeps, summary: RunSummary, startedAt: number) {
	const { store, sources, limits } = deps
	const exhausted = new Set<string>()
	const searches = new Map<string, Promise<Array<FoundItem>>>()
	const queue = store.dueAlerts(startedAt, limits.checkIntervalMs, limits.maxAlertsPerRun)

	const search = (source: Source, query: SearchQuery) => {
		const key = searchKey(source, query)
		const pending = searches.get(key) ?? source.search(query)
		searches.set(key, pending)
		return pending
	}

	const fromSource = async (source: Source, query: SearchQuery, alertId: number): Promise<Array<FoundItem> | undefined> => {
		if (exhausted.has(source.name)) return undefined
		try {
			return await search(source, query)
		} catch (error) {
			summary.sourceErrors[source.name] = (summary.sourceErrors[source.name] ?? 0) + 1
			if (error instanceof SourceError && error.budgetExhausted) exhausted.add(source.name)
			deps.log(`[alertes] source ${source.name}, alerte ${alertId} : ${(error as Error).message}`)
			return undefined
		}
	}

	const collect = async (alert: StoredAlert): Promise<{ found: Array<FoundItem>; failed: boolean }> => {
		const query: SearchQuery = { query: alert.query, reference: alert.reference ?? undefined, maxPriceCents: alert.maxPriceCents ?? undefined }
		const found: Array<FoundItem> = []
		let failed = false
		for (const source of sources) {
			const items = await fromSource(source, query, alert.id)
			if (items) found.push(...items)
			else failed = true
		}
		return { found, failed }
	}

	const checkOne = async (alert: StoredAlert) => {
		const { found, failed } = await collect(alert)
		const now = deps.now()
		const firstCheck = alert.lastCheckedAt === null
		if (firstCheck) {
			summary.newMatches += store.addMatches(alert.id, found.slice(0, limits.maxItemsPerEmail), now)
			store.markSeen(alert.id, found.slice(limits.maxItemsPerEmail), now)
		} else {
			summary.newMatches += store.addMatches(alert.id, found, now)
		}
		if (firstCheck && failed) return
		store.markChecked(alert.id, now)
		summary.checked++
	}

	let next = 0
	const worker = async () => {
		while (next < queue.length) {
			if (deps.now() - startedAt >= limits.runBudgetMs) return
			const alert = queue[next++]
			if (alert) await checkOne(alert)
		}
	}
	await Promise.all(Array.from({ length: Math.max(1, Math.min(limits.runConcurrency, queue.length)) }, worker))
	summary.deferred = queue.length - next
	summary.budgetExhausted = [...exhausted]
}

function groupForEmail(matches: Array<PendingMatch>, maxItems: number): { groups: Array<DigestGroup>; sent: Array<PendingMatch>; extraCount: number } {
	const keyOf = (match: PendingMatch) => `${match.source}:${match.itemId}`
	const chosen = new Set<string>()
	const unique: Array<PendingMatch> = []
	for (const match of matches) {
		if (chosen.has(keyOf(match))) continue
		chosen.add(keyOf(match))
		unique.push(match)
	}
	const included = unique.slice(0, maxItems)
	const includedKeys = new Set(included.map(keyOf))
	const groups = new Map<number, DigestGroup>()
	for (const match of included) {
		const group = groups.get(match.alertId) ?? { query: match.query, expiresAt: match.expiresAt, items: [] }
		group.items.push({
			title: match.title,
			priceCents: match.priceCents,
			currency: match.currency,
			url: match.url,
			imageUrl: match.imageUrl,
			condition: match.condition,
			source: match.source,
			foundAt: match.foundAt
		})
		groups.set(match.alertId, group)
	}
	return { groups: [...groups.values()], sent: matches.filter((match) => includedKeys.has(keyOf(match))), extraCount: unique.length - included.length }
}

async function sendDigests(deps: RunDeps, summary: RunSummary) {
	const { store, limits, links } = deps
	const bySubscriber = new Map<number, Array<PendingMatch>>()
	for (const match of store.pendingMatches()) {
		const list = bySubscriber.get(match.subscriberId) ?? []
		list.push(match)
		bySubscriber.set(match.subscriberId, list)
	}
	for (const [subscriberId, matches] of bySubscriber) {
		const now = deps.now()
		if (store.countEmails(subscriberId, 'digest', now - DAY) >= limits.maxEmailsPerSubscriberPerDay) continue
		const email = store.subscriberEmail(subscriberId)
		if (!email) continue
		const { groups, sent, extraCount } = groupForEmail(matches, limits.maxItemsPerEmail)
		const rendered = digestEmail({ groups, extraCount, manageUrl: links.manage(subscriberId), unsubscribeUrl: links.unsubscribe(subscriberId), now, sender: deps.sender })
		try {
			await deps.mailer.send(email, rendered)
		} catch (error) {
			summary.emailFailures++
			deps.log(`[alertes] envoi au contact ${subscriberId} en échec : ${(error as Error).message}`)
			continue
		}
		store.recordEmail(subscriberId, 'digest', now)
		store.markNotified(sent, now)
		summary.emailsSent++
	}
}

async function sendReminders(deps: RunDeps, summary: RunSummary) {
	const { store, limits, links } = deps
	for (const alert of store.alertsNeedingReminder(deps.now(), limits.expiryReminderMs)) {
		if (alert.expiresAt === null) continue
		const rendered = expiryEmail({
			query: alert.query,
			expiresAt: alert.expiresAt,
			manageUrl: links.manage(alert.subscriberId),
			unsubscribeUrl: links.unsubscribe(alert.subscriberId),
			sender: deps.sender
		})
		try {
			await deps.mailer.send(alert.email, rendered)
		} catch (error) {
			deps.log(`[alertes] rappel d’expiration ${alert.id} en échec : ${(error as Error).message}`)
			continue
		}
		store.recordEmail(alert.subscriberId, 'reminder', deps.now())
		store.markReminderSent(alert.id, deps.now())
		summary.remindersSent++
	}
}

export async function runAlerts(deps: RunDeps): Promise<RunSummary> {
	const { store, limits } = deps
	const startedAt = deps.now()
	if (!store.tryLock('run', startedAt, limits.runLockMs)) return emptySummary('busy')
	const summary = emptySummary('ok')
	try {
		summary.cleanup = store.cleanup(startedAt, limits.pendingTtlMs)
		await checkAlerts(deps, summary, startedAt)
		summary.staleDiscarded = store.discardStaleMatches(deps.now(), limits.itemFreshnessMs)
		await sendDigests(deps, summary)
		await sendReminders(deps, summary)
		return summary
	} finally {
		store.releaseLock('run')
	}
}
