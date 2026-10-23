import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import type { FoundItem } from './sources/types'
import { compactReference, normalizeText } from './text'
import type { AlertInput } from './validation'

type SqlValue = string | number | bigint | null | Uint8Array
type Row = Record<string, SqlValue>

interface Statement {
	run(...params: Array<SqlValue>): { changes: number | bigint; lastInsertRowid: number | bigint }
	get(...params: Array<SqlValue>): Row | undefined
	all(...params: Array<SqlValue>): Array<Row>
}

interface Database {
	exec(sql: string): void
	prepare(sql: string): Statement
	close(): void
}

type DatabaseConstructor = new (path: string) => Database

export type AlertStatus = 'pending' | 'active'

export interface StoredAlert {
	id: number
	subscriberId: number
	email: string
	query: string
	reference: string | null
	maxPriceCents: number | null
	status: AlertStatus
	createdAt: number
	confirmedAt: number | null
	expiresAt: number | null
	lastCheckedAt: number | null
	reminderSentAt: number | null
}

export interface PendingMatch {
	alertId: number
	subscriberId: number
	query: string
	expiresAt: number | null
	source: string
	itemId: string
	title: string
	priceCents: number | null
	currency: string
	url: string
	imageUrl: string | null
	condition: string | null
	foundAt: number
}

export type CreateResult = { created: true; reused: boolean; alert: StoredAlert } | { created: false; reason: 'too_many_alerts' | 'too_many_confirmations' | 'duplicate' | 'global_limit' }

export interface CreateLimits {
	maxActiveAlertsPerEmail: number
	maxConfirmationsPerEmailPerDay: number
	maxConfirmationsPerHour: number
}

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
CREATE TABLE IF NOT EXISTS subscribers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS alerts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
	query TEXT NOT NULL,
	reference TEXT,
	max_price_cents INTEGER,
	status TEXT NOT NULL CHECK (status IN ('pending', 'active')),
	consent_version TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	confirmed_at INTEGER,
	expires_at INTEGER,
	last_checked_at INTEGER,
	reminder_sent_at INTEGER
);
CREATE INDEX IF NOT EXISTS alerts_due ON alerts(status, last_checked_at);
CREATE INDEX IF NOT EXISTS alerts_subscriber ON alerts(subscriber_id);
CREATE TABLE IF NOT EXISTS matches (
	alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
	source TEXT NOT NULL,
	item_id TEXT NOT NULL,
	title TEXT NOT NULL DEFAULT '',
	price_cents INTEGER,
	currency TEXT NOT NULL DEFAULT 'EUR',
	url TEXT NOT NULL DEFAULT '',
	image_url TEXT,
	condition TEXT,
	found_at INTEGER NOT NULL,
	notified_at INTEGER,
	PRIMARY KEY (alert_id, source, item_id)
);
CREATE INDEX IF NOT EXISTS matches_pending ON matches(notified_at, found_at);
CREATE TABLE IF NOT EXISTS email_log (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
	kind TEXT NOT NULL,
	sent_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS email_log_lookup ON email_log(subscriber_id, kind, sent_at);
CREATE TABLE IF NOT EXISTS api_usage (
	day TEXT NOT NULL,
	source TEXT NOT NULL,
	calls INTEGER NOT NULL,
	PRIMARY KEY (day, source)
);
CREATE TABLE IF NOT EXISTS locks (
	name TEXT PRIMARY KEY,
	until INTEGER NOT NULL
);
`

const ALERT_COLUMNS = 'a.id, a.subscriber_id, s.email, a.query, a.reference, a.max_price_cents, a.status, a.created_at, a.confirmed_at, a.expires_at, a.last_checked_at, a.reminder_sent_at'

const HOUR = 3600000
const DAY = 24 * HOUR

const sameCriteria = (alert: StoredAlert, input: AlertInput) =>
	normalizeText(alert.query) === normalizeText(input.query) &&
	compactReference(alert.reference ?? '') === compactReference(input.reference ?? '') &&
	alert.maxPriceCents === (input.maxPriceCents ?? null)

const num = (value: SqlValue | undefined): number => Number(value)
const optNum = (value: SqlValue | undefined): number | null => (value === null || value === undefined ? null : Number(value))
const str = (value: SqlValue | undefined): string => (typeof value === 'string' ? value : String(value ?? ''))
const optStr = (value: SqlValue | undefined): string | null => (value === null || value === undefined ? null : String(value))

function toAlert(row: Row): StoredAlert {
	return {
		id: num(row.id),
		subscriberId: num(row.subscriber_id),
		email: str(row.email),
		query: str(row.query),
		reference: optStr(row.reference),
		maxPriceCents: optNum(row.max_price_cents),
		status: str(row.status) === 'active' ? 'active' : 'pending',
		createdAt: num(row.created_at),
		confirmedAt: optNum(row.confirmed_at),
		expiresAt: optNum(row.expires_at),
		lastCheckedAt: optNum(row.last_checked_at),
		reminderSentAt: optNum(row.reminder_sent_at)
	}
}

function loadSqlite(): DatabaseConstructor {
	const module = (process as unknown as { getBuiltinModule?: (id: string) => unknown }).getBuiltinModule?.('node:sqlite')
	const factory: unknown = module && typeof module === 'object' ? Reflect.get(module, 'DatabaseSync') : undefined
	if (typeof factory !== 'function') throw new Error('node:sqlite indisponible : Node.js 22.13 ou plus récent est requis')
	return factory as DatabaseConstructor
}

export class AlertStore {
	private readonly db: Database

	constructor(path: string) {
		if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
		const SqliteDatabase = loadSqlite()
		this.db = new SqliteDatabase(path)
		this.db.exec(SCHEMA)
	}

	close() {
		this.db.close()
	}

	transaction<T>(work: () => T): T {
		this.db.exec('BEGIN IMMEDIATE')
		try {
			const result = work()
			this.db.exec('COMMIT')
			return result
		} catch (error) {
			this.db.exec('ROLLBACK')
			throw error
		}
	}

	createPendingAlert(input: AlertInput, now: number, consentVersion: string, limits: CreateLimits): CreateResult {
		return this.transaction(() => {
			const sentLastHour = num(this.db.prepare("SELECT COUNT(*) AS n FROM email_log WHERE kind = 'confirm' AND sent_at > ?").get(now - HOUR)?.n)
			if (sentLastHour >= limits.maxConfirmationsPerHour) return { created: false, reason: 'global_limit' } as const
			this.db.prepare('INSERT INTO subscribers (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING').run(input.email, now)
			const subscriber = this.db.prepare('SELECT id FROM subscribers WHERE email = ?').get(input.email)
			const subscriberId = num(subscriber?.id)
			const existing = this.listAlerts(subscriberId)
			const same = existing.find((alert) => sameCriteria(alert, input))
			if (same?.status === 'active') return { created: false, reason: 'duplicate' } as const
			if (!same && existing.length >= limits.maxActiveAlertsPerEmail) return { created: false, reason: 'too_many_alerts' } as const
			const confirmations = this.countEmails(subscriberId, 'confirm', now - DAY)
			if (confirmations >= limits.maxConfirmationsPerEmailPerDay) return { created: false, reason: 'too_many_confirmations' } as const
			if (same) return { created: true, reused: true, alert: same } as const
			const inserted = this.db
				.prepare('INSERT INTO alerts (subscriber_id, query, reference, max_price_cents, status, consent_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
				.run(subscriberId, input.query, input.reference ?? null, input.maxPriceCents ?? null, 'pending', consentVersion, now)
			const alert = this.getAlert(Number(inserted.lastInsertRowid))
			if (!alert) throw new Error('alerte introuvable après insertion')
			return { created: true, reused: false, alert } as const
		})
	}

	getAlert(id: number): StoredAlert | undefined {
		const row = this.db.prepare(`SELECT ${ALERT_COLUMNS} FROM alerts a JOIN subscribers s ON s.id = a.subscriber_id WHERE a.id = ?`).get(id)
		return row ? toAlert(row) : undefined
	}

	activateAlert(id: number, now: number, ttlMs: number): StoredAlert | undefined {
		const result = this.db.prepare("UPDATE alerts SET status = 'active', confirmed_at = ?, expires_at = ?, last_checked_at = NULL WHERE id = ? AND status = 'pending'").run(now, now + ttlMs, id)
		return Number(result.changes) === 1 ? this.getAlert(id) : undefined
	}

	listAlerts(subscriberId: number): Array<StoredAlert> {
		return this.db.prepare(`SELECT ${ALERT_COLUMNS} FROM alerts a JOIN subscribers s ON s.id = a.subscriber_id WHERE a.subscriber_id = ? ORDER BY a.created_at`).all(subscriberId).map(toAlert)
	}

	subscriberEmail(subscriberId: number): string | undefined {
		const row = this.db.prepare('SELECT email FROM subscribers WHERE id = ?').get(subscriberId)
		return row ? str(row.email) : undefined
	}

	deleteAlert(subscriberId: number, alertId: number): boolean {
		return this.transaction(() => {
			const changed = Number(this.db.prepare('DELETE FROM alerts WHERE id = ? AND subscriber_id = ?').run(alertId, subscriberId).changes) === 1
			this.deleteOrphanSubscribers()
			return changed
		})
	}

	extendAlert(subscriberId: number, alertId: number, now: number, ttlMs: number): boolean {
		const result = this.db.prepare("UPDATE alerts SET expires_at = ?, reminder_sent_at = NULL WHERE id = ? AND subscriber_id = ? AND status = 'active'").run(now + ttlMs, alertId, subscriberId)
		return Number(result.changes) === 1
	}

	deleteSubscriber(subscriberId: number): boolean {
		return Number(this.db.prepare('DELETE FROM subscribers WHERE id = ?').run(subscriberId).changes) === 1
	}

	recordEmail(subscriberId: number, kind: string, now: number) {
		this.db.prepare('INSERT INTO email_log (subscriber_id, kind, sent_at) VALUES (?, ?, ?)').run(subscriberId, kind, now)
	}

	countEmails(subscriberId: number, kind: string, since: number): number {
		return num(this.db.prepare('SELECT COUNT(*) AS n FROM email_log WHERE subscriber_id = ? AND kind = ? AND sent_at > ?').get(subscriberId, kind, since)?.n)
	}

	dueAlerts(now: number, intervalMs: number, limit: number): Array<StoredAlert> {
		return this.db
			.prepare(
				`SELECT ${ALERT_COLUMNS} FROM alerts a JOIN subscribers s ON s.id = a.subscriber_id
				WHERE a.status = 'active' AND a.expires_at > ? AND (a.last_checked_at IS NULL OR a.last_checked_at <= ?)
				ORDER BY a.last_checked_at IS NOT NULL, a.last_checked_at, a.id LIMIT ?`
			)
			.all(now, now - intervalMs, limit)
			.map(toAlert)
	}

	markChecked(alertId: number, now: number) {
		this.db.prepare('UPDATE alerts SET last_checked_at = ? WHERE id = ?').run(now, alertId)
	}

	addMatches(alertId: number, items: Array<FoundItem>, now: number): number {
		const insert = this.db.prepare(
			'INSERT INTO matches (alert_id, source, item_id, title, price_cents, currency, url, image_url, condition, found_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING'
		)
		return this.transaction(() => {
			let added = 0
			for (const item of items) {
				const result = insert.run(alertId, item.source, item.itemId, item.title, item.priceCents ?? null, item.currency, item.url, item.imageUrl ?? null, item.condition ?? null, now)
				added += Number(result.changes)
			}
			return added
		})
	}

	markSeen(alertId: number, items: Array<Pick<FoundItem, 'source' | 'itemId'>>, now: number): number {
		const insert = this.db.prepare('INSERT INTO matches (alert_id, source, item_id, found_at, notified_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING')
		return this.transaction(() => {
			let added = 0
			for (const item of items) added += Number(insert.run(alertId, item.source, item.itemId, now, now).changes)
			return added
		})
	}

	discardStaleMatches(now: number, freshnessMs: number): number {
		const result = this.db
			.prepare("UPDATE matches SET notified_at = ?, title = '', url = '', image_url = NULL, condition = NULL, price_cents = NULL WHERE notified_at IS NULL AND found_at < ?")
			.run(now, now - freshnessMs)
		return Number(result.changes)
	}

	pendingMatches(): Array<PendingMatch> {
		return this.db
			.prepare(
				`SELECT m.alert_id, a.subscriber_id, a.query, a.expires_at, m.source, m.item_id, m.title, m.price_cents, m.currency, m.url, m.image_url, m.condition, m.found_at
				FROM matches m JOIN alerts a ON a.id = m.alert_id
				WHERE m.notified_at IS NULL AND a.status = 'active'
				ORDER BY a.subscriber_id, m.found_at, m.alert_id`
			)
			.all()
			.map((row) => ({
				alertId: num(row.alert_id),
				subscriberId: num(row.subscriber_id),
				query: str(row.query),
				expiresAt: optNum(row.expires_at),
				source: str(row.source),
				itemId: str(row.item_id),
				title: str(row.title),
				priceCents: optNum(row.price_cents),
				currency: str(row.currency),
				url: str(row.url),
				imageUrl: optStr(row.image_url),
				condition: optStr(row.condition),
				foundAt: num(row.found_at)
			}))
	}

	markNotified(matches: Array<Pick<PendingMatch, 'alertId' | 'source' | 'itemId'>>, now: number) {
		const update = this.db.prepare("UPDATE matches SET notified_at = ?, title = '', url = '', image_url = NULL, condition = NULL, price_cents = NULL WHERE alert_id = ? AND source = ? AND item_id = ?")
		this.transaction(() => {
			for (const match of matches) update.run(now, match.alertId, match.source, match.itemId)
		})
	}

	alertsNeedingReminder(now: number, windowMs: number): Array<StoredAlert> {
		return this.db
			.prepare(
				`SELECT ${ALERT_COLUMNS} FROM alerts a JOIN subscribers s ON s.id = a.subscriber_id
				WHERE a.status = 'active' AND a.reminder_sent_at IS NULL AND a.expires_at > ? AND a.expires_at <= ?`
			)
			.all(now, now + windowMs)
			.map(toAlert)
	}

	markReminderSent(alertId: number, now: number) {
		this.db.prepare('UPDATE alerts SET reminder_sent_at = ? WHERE id = ?').run(now, alertId)
	}

	cleanup(now: number, pendingTtlMs: number): { pending: number; expired: number; subscribers: number } {
		return this.transaction(() => {
			const pending = Number(this.db.prepare("DELETE FROM alerts WHERE status = 'pending' AND created_at < ?").run(now - pendingTtlMs).changes)
			const expired = Number(this.db.prepare("DELETE FROM alerts WHERE status = 'active' AND expires_at <= ?").run(now).changes)
			this.db.prepare('DELETE FROM email_log WHERE sent_at < ?').run(now - 2 * DAY)
			this.db.prepare('DELETE FROM api_usage WHERE day < ?').run(new Date(now - 7 * DAY).toISOString().slice(0, 10))
			const subscribers = this.deleteOrphanSubscribers()
			return { pending, expired, subscribers }
		})
	}

	private deleteOrphanSubscribers(): number {
		return Number(this.db.prepare('DELETE FROM subscribers WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE alerts.subscriber_id = subscribers.id)').run().changes)
	}

	takeApiCall(source: string, now: number, dailyBudget: number): boolean {
		const day = new Date(now).toISOString().slice(0, 10)
		return this.transaction(() => {
			const used = num(this.db.prepare('SELECT calls FROM api_usage WHERE day = ? AND source = ?').get(day, source)?.calls ?? 0)
			if (used >= dailyBudget) return false
			this.db.prepare('INSERT INTO api_usage (day, source, calls) VALUES (?, ?, 1) ON CONFLICT(day, source) DO UPDATE SET calls = calls + 1').run(day, source)
			return true
		})
	}

	apiCalls(source: string, now: number): number {
		const day = new Date(now).toISOString().slice(0, 10)
		return num(this.db.prepare('SELECT calls FROM api_usage WHERE day = ? AND source = ?').get(day, source)?.calls ?? 0)
	}

	tryLock(name: string, now: number, ttlMs: number): boolean {
		return this.transaction(() => {
			const current = this.db.prepare('SELECT until FROM locks WHERE name = ?').get(name)
			if (current && num(current.until) > now) return false
			this.db.prepare('INSERT INTO locks (name, until) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET until = excluded.until').run(name, now + ttlMs)
			return true
		})
	}

	releaseLock(name: string) {
		this.db.prepare('DELETE FROM locks WHERE name = ?').run(name)
	}
}
