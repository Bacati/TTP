import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { DEFAULT_LIMITS } from '../src/alerts/config'
import { AlertStore } from '../src/alerts/store'
import type { AlertInput } from '../src/alerts/validation'
import { DAY, HOUR, T0, item } from './support/alertes'

const LIMITS = { maxActiveAlertsPerEmail: 5, maxConfirmationsPerEmailPerDay: 3, maxConfirmationsPerHour: 100 }
const input = (extra: Partial<AlertInput> = {}): AlertInput => ({ email: 'lucas@example.fr', query: 'Carter Derbi', reference: undefined, maxPriceCents: 15000, ...extra })

let store: AlertStore

function activeAlert(extra: Partial<AlertInput> = {}, at = T0) {
	const created = store.createPendingAlert(input(extra), at, 'v1', LIMITS)
	if (!created.created) throw new Error(created.reason)
	const alert = store.activateAlert(created.alert.id, at, DEFAULT_LIMITS.alertTtlMs)
	if (!alert) throw new Error('activation impossible')
	return alert
}

beforeEach(() => {
	store = new AlertStore(':memory:')
})

afterEach(() => {
	store.close()
})

describe('création et confirmation', () => {
	test('une alerte est créée en attente puis activée une seule fois', () => {
		const created = store.createPendingAlert(input({ reference: '00H01205041' }), T0, 'v1', LIMITS)
		expect(created.created).toBe(true)
		if (!created.created) return
		expect(created.alert).toMatchObject({ status: 'pending', email: 'lucas@example.fr', query: 'Carter Derbi', reference: '00H01205041', maxPriceCents: 15000, expiresAt: null })
		const active = store.activateAlert(created.alert.id, T0 + HOUR, 180 * DAY)
		expect(active).toMatchObject({ status: 'active', confirmedAt: T0 + HOUR, expiresAt: T0 + HOUR + 180 * DAY })
		expect(store.activateAlert(created.alert.id, T0 + 2 * HOUR, 180 * DAY)).toBeUndefined()
	})

	test('limite d’alertes par adresse', () => {
		for (let i = 0; i < 5; i++) expect(store.createPendingAlert(input({ query: `Pièce ${i}` }), T0, 'v1', LIMITS).created).toBe(true)
		expect(store.createPendingAlert(input(), T0, 'v1', LIMITS)).toEqual({ created: false, reason: 'too_many_alerts' })
		expect(store.createPendingAlert(input({ email: 'autre@example.fr' }), T0, 'v1', LIMITS).created).toBe(true)
	})

	test('limite d’e-mails de confirmation par jour', () => {
		const first = store.createPendingAlert(input(), T0, 'v1', LIMITS)
		if (!first.created) throw new Error()
		for (let i = 0; i < 3; i++) store.recordEmail(first.alert.subscriberId, 'confirm', T0 + i)
		expect(store.createPendingAlert(input({ query: 'Autre' }), T0 + HOUR, 'v1', LIMITS)).toEqual({ created: false, reason: 'too_many_confirmations' })
		expect(store.createPendingAlert(input({ query: 'Autre' }), T0 + DAY + HOUR, 'v1', LIMITS).created).toBe(true)
	})

	test('les textes hostiles sont stockés tels quels', () => {
		const hostile = "x'); DROP TABLE alerts;-- <script>"
		const created = store.createPendingAlert(input({ query: hostile }), T0, 'v1', LIMITS)
		expect(created.created && store.getAlert(created.alert.id)?.query).toBe(hostile)
		expect(store.listAlerts(created.created ? created.alert.subscriberId : 0)).toHaveLength(1)
	})
})

describe('gestion par l’abonné', () => {
	test('suppression limitée à ses propres alertes', () => {
		const mine = activeAlert()
		const other = activeAlert({ email: 'autre@example.fr' })
		expect(store.deleteAlert(mine.subscriberId, other.id)).toBe(false)
		expect(store.getAlert(other.id)).toBeDefined()
		expect(store.deleteAlert(mine.subscriberId, mine.id)).toBe(true)
		expect(store.subscriberEmail(mine.subscriberId)).toBeUndefined()
	})

	test('prolongation réservée aux alertes actives de l’abonné', () => {
		const alert = activeAlert()
		const pending = store.createPendingAlert(input({ query: 'Attente' }), T0, 'v1', LIMITS)
		store.markReminderSent(alert.id, T0)
		expect(store.extendAlert(alert.subscriberId, alert.id, T0 + 100 * DAY, 180 * DAY)).toBe(true)
		expect(store.getAlert(alert.id)).toMatchObject({ expiresAt: T0 + 280 * DAY, reminderSentAt: null })
		expect(pending.created && store.extendAlert(alert.subscriberId, pending.alert.id, T0, DAY)).toBe(false)
		expect(store.extendAlert(alert.subscriberId + 99, alert.id, T0, DAY)).toBe(false)
	})

	test('la désinscription efface tout en cascade', () => {
		const alert = activeAlert()
		store.addMatches(alert.id, [item('1')], T0)
		store.recordEmail(alert.subscriberId, 'digest', T0)
		expect(store.deleteSubscriber(alert.subscriberId)).toBe(true)
		expect(store.getAlert(alert.id)).toBeUndefined()
		expect(store.pendingMatches()).toEqual([])
		expect(store.countEmails(alert.subscriberId, 'digest', 0)).toBe(0)
	})

	test('les identifiants ne sont jamais réutilisés après suppression', () => {
		const first = activeAlert()
		store.deleteSubscriber(first.subscriberId)
		const second = activeAlert({ email: 'nouveau@example.fr' })
		expect(second.subscriberId).toBeGreaterThan(first.subscriberId)
		expect(second.id).toBeGreaterThan(first.id)
	})
})

describe('vérifications et annonces', () => {
	test('ordre de passage : jamais vérifiées d’abord, intervalle respecté, expirées exclues', () => {
		const a = activeAlert({ query: 'A' })
		const b = activeAlert({ query: 'B' })
		const c = activeAlert({ email: 'c@example.fr', query: 'C' })
		store.markChecked(a.id, T0 + 10)
		expect(store.dueAlerts(T0 + 20, HOUR, 10).map((x) => x.id)).toEqual([b.id, c.id])
		expect(store.dueAlerts(T0 + HOUR + 10, HOUR, 10).map((x) => x.id)).toEqual([b.id, c.id, a.id])
		expect(store.dueAlerts(T0 + HOUR + 10, HOUR, 1).map((x) => x.id)).toEqual([b.id])
		expect(store.dueAlerts(T0 + 181 * DAY, HOUR, 10)).toEqual([])
	})

	test('les alertes en attente ne sont jamais vérifiées', () => {
		store.createPendingAlert(input(), T0, 'v1', LIMITS)
		expect(store.dueAlerts(T0, HOUR, 10)).toEqual([])
	})

	test('dédoublonnage des annonces et effacement du contenu après envoi', () => {
		const alert = activeAlert()
		expect(store.addMatches(alert.id, [item('1'), item('2')], T0)).toBe(2)
		expect(store.addMatches(alert.id, [item('1'), item('3')], T0 + 1)).toBe(1)
		const pending = store.pendingMatches()
		expect(pending.map((m) => m.itemId)).toEqual(['1', '2', '3'])
		expect(pending[0]).toMatchObject({ title: 'Carter Derbi 1', priceCents: 4500, url: 'https://www.ebay.fr/itm/1?campid=5338000000', query: 'Carter Derbi' })
		store.markNotified([pending[0] as (typeof pending)[number]], T0 + 2)
		expect(store.pendingMatches().map((m) => m.itemId)).toEqual(['2', '3'])
		expect(store.addMatches(alert.id, [item('1')], T0 + 3)).toBe(0)
	})

	test('les annonces trop anciennes sont écartées', () => {
		const alert = activeAlert()
		store.addMatches(alert.id, [item('vieux')], T0)
		store.addMatches(alert.id, [item('frais')], T0 + 5 * HOUR)
		expect(store.discardStaleMatches(T0 + 7 * HOUR, 6 * HOUR)).toBe(1)
		expect(store.pendingMatches().map((m) => m.itemId)).toEqual(['frais'])
	})

	test('nettoyage : demandes non confirmées, alertes expirées et adresses orphelines', () => {
		const old = store.createPendingAlert(input({ email: 'oublie@example.fr' }), T0, 'v1', LIMITS)
		const recent = store.createPendingAlert(input({ email: 'recent@example.fr' }), T0 + 47 * HOUR, 'v1', LIMITS)
		const expiring = activeAlert({ email: 'expire@example.fr' })
		const result = store.cleanup(T0 + 181 * DAY, 48 * HOUR)
		expect(result).toEqual({ pending: 2, expired: 1, subscribers: 3 })
		expect(old.created && store.getAlert(old.alert.id)).toBeUndefined()
		expect(recent.created && store.getAlert(recent.alert.id)).toBeUndefined()
		expect(store.getAlert(expiring.id)).toBeUndefined()
		const keep = store.createPendingAlert(input({ email: 'garde@example.fr' }), T0 + 181 * DAY, 'v1', LIMITS)
		expect(store.cleanup(T0 + 181 * DAY + HOUR, 48 * HOUR).pending).toBe(0)
		expect(keep.created && store.getAlert(keep.alert.id)).toBeDefined()
	})

	test('rappel d’expiration dans la fenêtre, une seule fois', () => {
		const alert = activeAlert()
		expect(store.alertsNeedingReminder(T0 + 100 * DAY, 7 * DAY)).toEqual([])
		const due = store.alertsNeedingReminder(T0 + 175 * DAY, 7 * DAY)
		expect(due.map((a) => a.id)).toEqual([alert.id])
		store.markReminderSent(alert.id, T0 + 175 * DAY)
		expect(store.alertsNeedingReminder(T0 + 176 * DAY, 7 * DAY)).toEqual([])
	})
})

describe('quota d’API et verrou', () => {
	test('le quota quotidien est respecté puis remis à zéro le lendemain', () => {
		for (let i = 0; i < 3; i++) expect(store.takeApiCall('ebay', T0, 3)).toBe(true)
		expect(store.takeApiCall('ebay', T0, 3)).toBe(false)
		expect(store.apiCalls('ebay', T0)).toBe(3)
		expect(store.takeApiCall('ebay', T0 + DAY, 3)).toBe(true)
		expect(store.takeApiCall('flux', T0, 3)).toBe(true)
	})

	test('le verrou empêche deux exécutions simultanées et expire', () => {
		expect(store.tryLock('run', T0, 1000)).toBe(true)
		expect(store.tryLock('run', T0 + 500, 1000)).toBe(false)
		expect(store.tryLock('run', T0 + 1001, 1000)).toBe(true)
		store.releaseLock('run')
		expect(store.tryLock('run', T0 + 1002, 1000)).toBe(true)
	})
})

describe('base sur disque', () => {
	let dir: string

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), 'alertes-'))
	})

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true })
	})

	test('les données survivent à la réouverture et le dossier est créé', () => {
		const path = join(dir, 'sous-dossier', 'alertes.sqlite')
		const first = new AlertStore(path)
		const created = first.createPendingAlert(input(), T0, 'v1', LIMITS)
		first.close()
		const second = new AlertStore(path)
		expect(created.created && second.getAlert(created.alert.id)?.email).toBe('lucas@example.fr')
		const other = new AlertStore(path)
		expect(second.tryLock('run', T0, 1000)).toBe(true)
		expect(other.tryLock('run', T0, 1000)).toBe(false)
		second.close()
		other.close()
	})
})
