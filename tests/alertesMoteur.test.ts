import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { DEFAULT_LIMITS } from '../src/alerts/config'
import { makeLinks } from '../src/alerts/links'
import { type RunDeps, runAlerts } from '../src/alerts/runner'
import { SourceError } from '../src/alerts/sources/types'
import { AlertStore } from '../src/alerts/store'
import { verifyToken } from '../src/alerts/tokens'
import type { AlertInput } from '../src/alerts/validation'
import { Clock, DAY, FakeSource, HOUR, MemoryMailer, SECRET, SENDER, SITE, item } from './support/alertes'

const LIMITS = { ...DEFAULT_LIMITS }
let store: AlertStore
let clock: Clock
let mailer: MemoryMailer
let ebay: FakeSource
let deps: RunDeps
let logs: Array<string>

const input = (extra: Partial<AlertInput> = {}): AlertInput => ({ email: 'lucas@example.fr', query: 'Carter Derbi', reference: undefined, maxPriceCents: undefined, ...extra })

function activeAlert(extra: Partial<AlertInput> = {}) {
	const created = store.createPendingAlert(input(extra), clock.now(), 'v1', LIMITS)
	if (!created.created) throw new Error(created.reason)
	const alert = store.activateAlert(created.alert.id, clock.now(), LIMITS.alertTtlMs)
	if (!alert) throw new Error('activation impossible')
	return alert
}

const sentTo = (address: string) => mailer.sent.filter((s) => s.to === address)

beforeEach(() => {
	store = new AlertStore(':memory:')
	clock = new Clock()
	mailer = new MemoryMailer()
	ebay = new FakeSource('ebay')
	logs = []
	deps = { store, sources: [ebay], mailer, links: makeLinks(SITE, SECRET), limits: LIMITS, sender: SENDER, now: clock.now, log: (m) => logs.push(m) }
})

afterEach(() => {
	store.close()
})

describe('cycle de vie d’une alerte', () => {
	test('premier passage : les annonces existantes partent dans un seul e-mail', async () => {
		activeAlert()
		ebay.items = [item('1'), item('2')]
		const summary = await runAlerts(deps)
		expect(summary).toMatchObject({ status: 'ok', checked: 1, newMatches: 2, emailsSent: 1, emailFailures: 0 })
		expect(mailer.sent).toHaveLength(1)
		const [{ email, to }] = mailer.sent as [(typeof mailer.sent)[number]]
		expect(to).toBe('lucas@example.fr')
		expect(email.subject).toBe('2 annonces pour « Carter Derbi »')
		expect(email.text).toContain('https://www.ebay.fr/itm/1?campid=5338000000')
		const unsubscribe = new URL(email.headers['List-Unsubscribe']?.slice(1, -1) ?? '')
		expect(unsubscribe.pathname).toBe('/api/alertes/desinscription')
		expect(verifyToken(SECRET, 'sub', unsubscribe.searchParams.get('t'), clock.now())).toBeTypeOf('number')
	})

	test('aucun doublon, puis seulement les nouvelles annonces', async () => {
		activeAlert()
		ebay.items = [item('1')]
		await runAlerts(deps)
		clock.advance(HOUR)
		expect((await runAlerts(deps)).emailsSent).toBe(0)
		ebay.items = [item('1'), item('2')]
		clock.advance(HOUR)
		await runAlerts(deps)
		expect(mailer.sent).toHaveLength(2)
		expect(mailer.sent[1]?.email.text).toContain('Carter Derbi 2')
		expect(mailer.sent[1]?.email.text).not.toContain('Carter Derbi 1 ')
	})

	test('l’intervalle de vérification est respecté', async () => {
		activeAlert()
		await runAlerts(deps)
		clock.advance(30 * 60000)
		expect((await runAlerts(deps)).checked).toBe(0)
		clock.advance(30 * 60000)
		expect((await runAlerts(deps)).checked).toBe(1)
		expect(ebay.queries).toHaveLength(2)
	})

	test('une alerte non confirmée n’est jamais interrogée', async () => {
		store.createPendingAlert(input(), clock.now(), 'v1', LIMITS)
		ebay.items = [item('1')]
		const summary = await runAlerts(deps)
		expect(summary.checked).toBe(0)
		expect(ebay.queries).toHaveLength(0)
		expect(mailer.sent).toHaveLength(0)
	})

	test('les critères de l’alerte sont transmis à la source', async () => {
		activeAlert({ query: 'Cylindre Airsal', reference: '00H01205041', maxPriceCents: 9000 })
		await runAlerts(deps)
		expect(ebay.queries).toEqual([{ query: 'Cylindre Airsal', reference: '00H01205041', maxPriceCents: 9000 }])
	})
})

describe('fiabilité de l’envoi', () => {
	test('un échec SMTP est retenté sans doublon', async () => {
		activeAlert()
		ebay.items = [item('1')]
		mailer.failing = true
		const failed = await runAlerts(deps)
		expect(failed).toMatchObject({ emailsSent: 0, emailFailures: 1 })
		expect(logs.join('\n')).not.toContain('lucas@example.fr')
		mailer.failing = false
		clock.advance(10 * 60000)
		expect((await runAlerts(deps)).emailsSent).toBe(1)
		clock.advance(HOUR)
		await runAlerts(deps)
		expect(mailer.sent).toHaveLength(1)
	})

	test('une annonce restée en attente plus de 6 heures n’est plus envoyée', async () => {
		activeAlert()
		ebay.items = [item('1')]
		mailer.failing = true
		await runAlerts(deps)
		clock.advance(7 * HOUR)
		mailer.failing = false
		ebay.items = []
		const summary = await runAlerts(deps)
		expect(summary.staleDiscarded).toBe(1)
		expect(mailer.sent).toHaveLength(0)
	})

	test('premier passage : 10 annonces au plus, les autres sont marquées comme vues sans e-mail', async () => {
		activeAlert()
		ebay.items = Array.from({ length: 12 }, (_, i) => item(String(i + 1)))
		await runAlerts(deps)
		expect(mailer.sent).toHaveLength(1)
		expect(mailer.sent[0]?.email.text.match(/https:\/\/www\.ebay\.fr\/itm\//g)).toHaveLength(10)
		expect(mailer.sent[0]?.email.text).not.toContain('autre(s) annonce(s)')
		for (let i = 0; i < 6; i++) {
			clock.advance(HOUR)
			await runAlerts(deps)
		}
		expect(mailer.sent).toHaveLength(1)
	})

	test('passages suivants : au plus 10 annonces par e-mail, le reste au passage suivant', async () => {
		activeAlert()
		ebay.items = [item('0')]
		await runAlerts(deps)
		clock.advance(HOUR)
		ebay.items = Array.from({ length: 13 }, (_, i) => item(String(i)))
		await runAlerts(deps)
		expect(mailer.sent[1]?.email.text.match(/https:\/\/www\.ebay\.fr\/itm\//g)).toHaveLength(10)
		expect(mailer.sent[1]?.email.text).toContain('Et 2 autre(s) annonce(s)')
		clock.advance(5 * 60000)
		await runAlerts(deps)
		expect(mailer.sent[2]?.email.text.match(/https:\/\/www\.ebay\.fr\/itm\//g)).toHaveLength(2)
		expect(mailer.sent).toHaveLength(3)
	})

	test('au plus 6 e-mails d’annonces par jour et par abonné', async () => {
		activeAlert()
		for (let i = 0; i < 8; i++) {
			ebay.items = [item(`n${i}`)]
			await runAlerts(deps)
			clock.advance(HOUR)
		}
		expect(mailer.sent).toHaveLength(6)
	})

	test('une même annonce trouvée par deux alertes n’est envoyée qu’une fois', async () => {
		activeAlert({ query: 'Carter Derbi' })
		activeAlert({ query: 'Carter embrayage' })
		ebay.items = [item('1')]
		await runAlerts(deps)
		expect(mailer.sent).toHaveLength(1)
		expect(mailer.sent[0]?.email.text.match(/itm\/1\?/g)).toHaveLength(1)
		expect(store.pendingMatches()).toEqual([])
	})

	test('chaque abonné ne reçoit que ses propres annonces', async () => {
		activeAlert({ email: 'a@example.fr', query: 'Carter' })
		activeAlert({ email: 'b@example.fr', query: 'Cylindre', maxPriceCents: 3000 })
		ebay.items = [item('cher', { priceCents: 9000 }), item('bon', { priceCents: 2000 })]
		await runAlerts(deps)
		expect(sentTo('a@example.fr')[0]?.email.text).toContain('Carter Derbi cher')
		expect(sentTo('b@example.fr')[0]?.email.text).not.toContain('Carter Derbi cher')
		expect(sentTo('b@example.fr')[0]?.email.text).toContain('Carter Derbi bon')
	})
})

describe('robustesse des sources', () => {
	test('une source en panne n’empêche pas les autres', async () => {
		const feed = new FakeSource('muc-off')
		deps.sources = [ebay, feed]
		activeAlert()
		ebay.error = new SourceError('eBay indisponible', { retryable: true })
		feed.items = [item('f1', { source: 'muc-off' })]
		const summary = await runAlerts(deps)
		expect(summary.sourceErrors).toEqual({ ebay: 1 })
		expect(summary.emailsSent).toBe(1)
		expect(logs.some((line) => line.includes('eBay indisponible'))).toBe(true)
	})

	test('quota épuisé : la source est ignorée pour le reste du passage', async () => {
		activeAlert({ query: 'A' })
		activeAlert({ query: 'B' })
		activeAlert({ query: 'C' })
		ebay.error = new SourceError('quota quotidien eBay atteint', { budgetExhausted: true })
		deps.limits = { ...LIMITS, runConcurrency: 1 }
		const summary = await runAlerts(deps)
		expect(ebay.queries).toHaveLength(1)
		expect(summary.budgetExhausted).toEqual(['ebay'])
		expect(summary.checked).toBe(0)
		ebay.error = undefined
		clock.advance(DAY)
		expect((await runAlerts(deps)).checked).toBe(3)
	})

	test('une exception inattendue de la source est contenue', async () => {
		activeAlert()
		ebay.error = new Error('bug imprévu')
		const summary = await runAlerts(deps)
		expect(summary.status).toBe('ok')
		expect(summary.sourceErrors.ebay).toBe(1)
	})

	test('le nombre d’alertes par passage est plafonné', async () => {
		for (let i = 0; i < 3; i++) activeAlert({ email: `x${i}@example.fr` })
		deps.limits = { ...LIMITS, maxAlertsPerRun: 2 }
		expect((await runAlerts(deps)).checked).toBe(2)
		expect((await runAlerts(deps)).checked).toBe(1)
	})
})

describe('verrou, nettoyage et rappels', () => {
	test('deux passages simultanés : le second est refusé et le verrou est libéré', async () => {
		activeAlert()
		let release: () => void = () => undefined
		ebay.search = async () => {
			await new Promise<void>((resolve) => {
				release = resolve
			})
			return []
		}
		const first = runAlerts(deps)
		await new Promise((resolve) => setTimeout(resolve, 10))
		expect((await runAlerts(deps)).status).toBe('busy')
		release()
		expect((await first).status).toBe('ok')
		expect(store.tryLock('run', clock.now(), 1000)).toBe(true)
	})

	test('le verrou est libéré même si l’envoi lève une erreur imprévue', async () => {
		activeAlert()
		ebay.items = [item('1')]
		deps.mailer = {
			send: () => {
				throw new Error('plantage')
			}
		}
		await runAlerts(deps)
		expect(store.tryLock('run', clock.now(), 1000)).toBe(true)
	})

	test('les alertes expirées sont supprimées et plus interrogées', async () => {
		activeAlert()
		clock.advance(181 * DAY)
		const summary = await runAlerts(deps)
		expect(summary.cleanup).toEqual({ pending: 0, expired: 1, subscribers: 1 })
		expect(ebay.queries).toHaveLength(0)
	})

	test('un seul rappel avant expiration, réarmé par la prolongation', async () => {
		const alert = activeAlert()
		clock.advance(174 * DAY)
		expect((await runAlerts(deps)).remindersSent).toBe(1)
		expect(mailer.sent.at(-1)?.email.subject).toBe('Votre alerte « Carter Derbi » expire bientôt')
		clock.advance(HOUR)
		expect((await runAlerts(deps)).remindersSent).toBe(0)
		store.extendAlert(alert.subscriberId, alert.id, clock.now(), LIMITS.alertTtlMs)
		clock.advance(174 * DAY)
		expect((await runAlerts(deps)).remindersSent).toBe(1)
	})

	test('après désinscription, plus aucun e-mail', async () => {
		const alert = activeAlert()
		ebay.items = [item('1')]
		mailer.failing = true
		await runAlerts(deps)
		store.deleteSubscriber(alert.subscriberId)
		mailer.failing = false
		clock.advance(HOUR)
		await runAlerts(deps)
		expect(mailer.sent).toHaveLength(0)
	})
})
