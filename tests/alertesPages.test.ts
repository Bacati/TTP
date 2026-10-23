import { describe, expect, test } from 'vitest'
import { type AlertsContext, formToken, handleConfirm, handleCreate, handleManage, handleRun, handleUnsubscribe } from '../src/alerts/handlers'
import { signToken } from '../src/alerts/tokens'
import { DAY, HOUR, MemoryMailer, RUN_TOKEN, SECRET, SITE, formRequest, linkFrom, testContext as makeContext, type testContext, tokenOf } from './support/alertes'

type Setup = ReturnType<typeof testContext>

const HONEYPOT = 'site_web'
const FIELDS = { email: 'lucas@example.fr', query: 'Carter Derbi Euro 3', reference: '', maxPrice: '150', consent: 'oui', [HONEYPOT]: '' }

function setup(overrides: Parameters<typeof makeContext>[0] = {}): Setup {
	return makeContext(overrides)
}

async function submit(s: Setup, fields: Record<string, string> = {}, headers?: Record<string, string>, ip = '203.0.113.7') {
	const token = formToken(s.ctx)
	s.clock.advance(3000)
	return handleCreate(formRequest('/alertes', { ...FIELDS, jeton: token, ...fields }, headers), ip, s.ctx)
}

async function createAndConfirm(s: Setup, fields: Record<string, string> = {}) {
	await submit(s, fields)
	const confirmLink = linkFrom(s.mailer.sent.at(-1)?.email.text ?? '', '/alertes/confirmer')
	const view = await handleConfirm(formRequest('/alertes/confirmer', { t: tokenOf(confirmLink) }), new URL(`${SITE}/alertes/confirmer`), s.ctx)
	if (view.state !== 'done') throw new Error(`confirmation impossible : ${view.state}`)
	return view
}

const manageUrl = (link: string) => new URL(link)

describe('création d’alerte', () => {
	test('affichage du formulaire avec un jeton anti-robot', async () => {
		const s = setup()
		const view = await handleCreate(new Request(`${SITE}/alertes`), '203.0.113.7', s.ctx)
		expect(view.state).toBe('form')
		expect(view.state === 'form' && view.formToken).toMatch(/^form\.\d+\.\d+\./)
	})

	test('demande valide : e-mail de confirmation et rien d’actif avant le clic', async () => {
		const s = setup()
		const view = await submit(s)
		expect(view).toEqual({ state: 'sent', status: 200 })
		expect(s.mailer.sent).toHaveLength(1)
		expect(s.mailer.sent[0]?.to).toBe('lucas@example.fr')
		expect(s.mailer.sent[0]?.email.subject).toBe('Confirmez votre alerte « Carter Derbi Euro 3 »')
		expect(s.ctx.store.dueAlerts(s.clock.now(), HOUR, 10)).toEqual([])
	})

	test('origine contrôlée', async () => {
		const s = setup()
		expect((await submit(s, {}, {})).status).toBe(403)
		expect((await submit(s, {}, { origin: 'https://evil.example' })).status).toBe(403)
		expect((await submit(s, {}, { origin: 'null' })).status).toBe(403)
		expect((await submit(s, {}, { referer: 'https://evil.example/page' })).status).toBe(403)
		expect((await submit(s, {}, { referer: `${SITE}/alertes` })).status).toBe(200)
		expect(s.mailer.sent).toHaveLength(1)
	})

	test('robots : champ piège ou envoi trop rapide, réponse identique et aucun e-mail', async () => {
		const s = setup()
		expect(await submit(s, { [HONEYPOT]: 'http://spam.example' })).toEqual({ state: 'sent', status: 200 })
		const fast = await handleCreate(formRequest('/alertes', { ...FIELDS, jeton: formToken(s.ctx) }), '203.0.113.7', s.ctx)
		expect(fast).toEqual({ state: 'sent', status: 200 })
		expect(s.mailer.sent).toHaveLength(0)
		expect(s.ctx.store.subscriberEmail(1)).toBeUndefined()
	})

	test('jeton de formulaire absent, falsifié ou expiré', async () => {
		const s = setup()
		const missing = await handleCreate(formRequest('/alertes', FIELDS), '203.0.113.7', s.ctx)
		expect(missing.status).toBe(400)
		const forged = await handleCreate(formRequest('/alertes', { ...FIELDS, jeton: signToken(`${SECRET}x`, 'form', 1, s.clock.now() + HOUR) }), '203.0.113.7', s.ctx)
		expect(forged.status).toBe(400)
		const token = formToken(s.ctx)
		s.clock.advance(3 * HOUR)
		const expired = await handleCreate(formRequest('/alertes', { ...FIELDS, jeton: token }), '203.0.113.7', s.ctx)
		expect(expired.status).toBe(400)
		expect(expired.state === 'form' && expired.values.query).toBe('Carter Derbi Euro 3')
		expect(s.mailer.sent).toHaveLength(0)
	})

	test('erreurs de saisie renvoyées avec les valeurs', async () => {
		const s = setup()
		const view = await submit(s, { email: 'faux', maxPrice: 'beaucoup' })
		expect(view.status).toBe(400)
		expect(view.state === 'form' && Object.keys(view.errors).sort()).toEqual(['email', 'maxPrice'])
		expect(view.state === 'form' && view.values.email).toBe('faux')
	})

	test('corps illisible ou mauvais type de contenu', async () => {
		const s = setup()
		const json = new Request(`${SITE}/alertes`, { method: 'POST', headers: { origin: SITE, 'content-type': 'application/json' }, body: JSON.stringify(FIELDS) })
		expect((await handleCreate(json, '203.0.113.7', s.ctx)).status).toBe(400)
		const huge = new Request(`${SITE}/alertes`, {
			method: 'POST',
			headers: { origin: SITE, 'content-type': 'application/x-www-form-urlencoded', 'content-length': '50000' },
			body: 'x'.repeat(50000)
		})
		expect((await handleCreate(huge, '203.0.113.7', s.ctx)).status).toBe(400)
	})

	test('limite par adresse IP, proxy pris en compte seulement s’il est déclaré', async () => {
		const s = setup()
		for (let i = 0; i < 10; i++) expect((await submit(s, { email: `x${i}@example.fr` })).status).toBe(200)
		expect((await submit(s, { email: 'y@example.fr' })).status).toBe(429)
		expect((await submit(s, { email: 'z@example.fr' }, { origin: SITE }, '198.51.100.1')).status).toBe(200)
		const spoof = await submit(s, { email: 'w@example.fr' }, { origin: SITE, 'x-forwarded-for': '192.0.2.99' })
		expect(spoof.status).toBe(429)
		const proxied = setup({ config: { trustProxy: true } })
		for (let i = 0; i < 10; i++) await submit(proxied, { email: `p${i}@example.fr` }, { origin: SITE, 'x-forwarded-for': '192.0.2.1, 10.0.0.1' }, '127.0.0.1')
		expect((await submit(proxied, { email: 'q@example.fr' }, { origin: SITE, 'x-forwarded-for': '192.0.2.1, 10.0.0.1' }, '127.0.0.1')).status).toBe(429)
		expect((await submit(proxied, { email: 'r@example.fr' }, { origin: SITE, 'x-forwarded-for': '10.0.0.2' }, '127.0.0.1')).status).toBe(200)
	})

	test('pas d’énumération : au-delà des limites, même réponse mais aucun e-mail', async () => {
		const s = setup()
		for (let i = 0; i < 3; i++) await submit(s, { query: `Pièce numéro ${i}` })
		expect(s.mailer.sent).toHaveLength(3)
		expect(await submit(s, { query: 'Pièce de trop' })).toEqual({ state: 'sent', status: 200 })
		expect(s.mailer.sent).toHaveLength(3)
		expect(s.logs.join('\n')).not.toContain('lucas@example.fr')
	})

	test('échec de l’envoi : message clair et aucune donnée conservée', async () => {
		const s = setup()
		s.mailer.failing = true
		const view = await submit(s)
		expect(view.status).toBe(503)
		expect(view.state === 'form' && view.values.maxPrice).toBe('150')
		expect(s.ctx.store.subscriberEmail(1)).toBeUndefined()
	})
})

describe('confirmation', () => {
	test('le lien affiche une confirmation, seul le POST active', async () => {
		const s = setup()
		await submit(s)
		const link = linkFrom(s.mailer.sent[0]?.email.text ?? '', '/alertes/confirmer')
		const ask = await handleConfirm(new Request(link), new URL(link), s.ctx)
		expect(ask.state).toBe('ask')
		expect(s.ctx.store.dueAlerts(s.clock.now(), HOUR, 10)).toEqual([])
		const done = await handleConfirm(formRequest('/alertes/confirmer', { t: tokenOf(link) }), new URL(`${SITE}/alertes/confirmer`), s.ctx)
		expect(done.state).toBe('done')
		expect(s.ctx.store.dueAlerts(s.clock.now(), HOUR, 10)).toHaveLength(1)
		const again = await handleConfirm(formRequest('/alertes/confirmer', { t: tokenOf(link) }), new URL(`${SITE}/alertes/confirmer`), s.ctx)
		expect(again.state).toBe('done')
	})

	test('lien expiré, falsifié, d’un autre type ou sans origine', async () => {
		const s = setup()
		await submit(s)
		const link = linkFrom(s.mailer.sent[0]?.email.text ?? '', '/alertes/confirmer')
		const t = tokenOf(link)
		const url = new URL(`${SITE}/alertes/confirmer`)
		expect((await handleConfirm(formRequest('/alertes/confirmer', { t }, {}), url, s.ctx)).status).toBe(403)
		expect((await handleConfirm(formRequest('/alertes/confirmer', { t: `${t}x` }), url, s.ctx)).state).toBe('invalid')
		expect((await handleConfirm(formRequest('/alertes/confirmer', { t: signToken(SECRET, 'sub', 1, 0) }), url, s.ctx)).state).toBe('invalid')
		expect((await handleConfirm(formRequest('/alertes/confirmer', { t: signToken(SECRET, 'confirm', 999, s.clock.now() + DAY) }), url, s.ctx)).state).toBe('invalid')
		s.clock.advance(49 * HOUR)
		expect((await handleConfirm(formRequest('/alertes/confirmer', { t }), url, s.ctx)).state).toBe('invalid')
	})
})

describe('gestion des alertes', () => {
	test('liste avec adresse masquée, prolongation et suppression', async () => {
		const s = setup()
		const done = await createAndConfirm(s)
		const url = manageUrl(done.manageUrl)
		const list = await handleManage(new Request(url), url, s.ctx)
		expect(list.state === 'list' && list.maskedEmail).toBe('lu***@example.fr')
		expect(list.state === 'list' && list.alerts.map((a) => a.query)).toEqual(['Carter Derbi Euro 3'])
		const t = tokenOf(done.manageUrl)
		const alertId = String(done.alert.id)
		s.clock.advance(10 * DAY)
		const extended = await handleManage(formRequest('/alertes/gerer', { t, action: 'prolonger', alerte: alertId }), url, s.ctx)
		expect(extended.state === 'list' && extended.notice).toBe('Alerte prolongée de 6 mois.')
		expect(s.ctx.store.getAlert(done.alert.id)?.expiresAt).toBe(s.clock.now() + 180 * DAY)
		const deleted = await handleManage(formRequest('/alertes/gerer', { t, action: 'supprimer', alerte: alertId }), url, s.ctx)
		expect(deleted.state).toBe('empty')
		expect(s.ctx.store.subscriberEmail(done.alert.subscriberId)).toBeUndefined()
	})

	test('impossible d’agir sur les alertes d’un autre abonné', async () => {
		const s = setup()
		const mine = await createAndConfirm(s)
		const other = await createAndConfirm(s, { email: 'autre@example.fr' })
		const t = tokenOf(mine.manageUrl)
		const url = manageUrl(mine.manageUrl)
		const attempt = await handleManage(formRequest('/alertes/gerer', { t, action: 'supprimer', alerte: String(other.alert.id) }), url, s.ctx)
		expect(attempt.state === 'list' && attempt.notice).toBe('Cette alerte n’existe plus.')
		expect(s.ctx.store.getAlert(other.alert.id)).toBeDefined()
		const extend = await handleManage(formRequest('/alertes/gerer', { t, action: 'prolonger', alerte: String(other.alert.id) }), url, s.ctx)
		expect(extend.state === 'list' && extend.notice).toBe('Cette alerte ne peut pas être prolongée.')
	})

	test('tout effacer, actions inconnues et requêtes sans origine', async () => {
		const s = setup()
		const done = await createAndConfirm(s)
		const t = tokenOf(done.manageUrl)
		const url = manageUrl(done.manageUrl)
		expect((await handleManage(formRequest('/alertes/gerer', { t, action: 'pirater' }), url, s.ctx)).status).toBe(400)
		expect((await handleManage(formRequest('/alertes/gerer', { t, action: 'supprimer', alerte: 'abc' }), url, s.ctx)).status).toBe(400)
		expect((await handleManage(formRequest('/alertes/gerer', { t, action: 'tout-supprimer' }, {}), url, s.ctx)).status).toBe(403)
		expect((await handleManage(formRequest('/alertes/gerer', { t, action: 'tout-supprimer' }), url, s.ctx)).state).toBe('empty')
		expect(s.ctx.store.getAlert(done.alert.id)).toBeUndefined()
		expect((await handleManage(new Request(`${SITE}/alertes/gerer?t=nimporte`), new URL(`${SITE}/alertes/gerer?t=nimporte`), s.ctx)).state).toBe('invalid')
	})
})

describe('désinscription en un clic', () => {
	test('POST efface tout, GET renvoie vers la page de gestion', async () => {
		const s = setup()
		const done = await createAndConfirm(s)
		const t = tokenOf(done.manageUrl)
		const url = new URL(`${SITE}/api/alertes/desinscription?t=${t}`)
		const get = await handleUnsubscribe(new Request(url), url, s.ctx)
		expect(get.status).toBe(303)
		expect(get.headers.get('location')).toBe(`/alertes/gerer?t=${encodeURIComponent(t)}`)
		const post = await handleUnsubscribe(new Request(url, { method: 'POST', body: 'List-Unsubscribe=One-Click' }), url, s.ctx)
		expect(post.status).toBe(200)
		expect(s.ctx.store.getAlert(done.alert.id)).toBeUndefined()
	})

	test('jeton invalide et méthodes non prévues', async () => {
		const s = setup()
		const url = new URL(`${SITE}/api/alertes/desinscription?t=faux`)
		expect((await handleUnsubscribe(new Request(url, { method: 'POST' }), url, s.ctx)).status).toBe(400)
		expect((await handleUnsubscribe(new Request(url), url, s.ctx)).headers.get('location')).toBe('/alertes')
		expect((await handleUnsubscribe(new Request(url, { method: 'PUT' }), url, s.ctx)).status).toBe(405)
	})
})

describe('déclenchement protégé', () => {
	const run = (ctx: AlertsContext, headers: Record<string, string> = {}, method = 'POST', ip = '192.0.2.10') => handleRun(new Request(`${SITE}/api/alertes/executer`, { method, headers }), ip, ctx)

	test('authentification exigée', async () => {
		const s = setup()
		expect((await run(s.ctx, {}, 'GET')).status).toBe(405)
		expect((await run(s.ctx)).status).toBe(401)
		expect((await run(s.ctx, { authorization: `Bearer ${RUN_TOKEN}x` })).status).toBe(401)
		expect((await run(s.ctx, { authorization: RUN_TOKEN })).status).toBe(401)
		expect((await run(s.ctx, { authorization: `Bearer ${SECRET}` })).status).toBe(401)
		const ok = await run(s.ctx, { authorization: `Bearer ${RUN_TOKEN}` })
		expect(ok.status).toBe(200)
		expect(await ok.json()).toMatchObject({ status: 'ok', checked: 0 })
		expect(ok.headers.get('cache-control')).toBe('no-store')
	})

	test('passage déjà en cours et force brute freinée', async () => {
		const s = setup()
		s.ctx.store.tryLock('run', s.clock.now(), HOUR)
		expect((await run(s.ctx, { authorization: `Bearer ${RUN_TOKEN}` })).status).toBe(409)
		const brute = setup()
		for (let i = 0; i < 10; i++) await run(brute.ctx, { authorization: 'Bearer essai' })
		expect((await run(brute.ctx, { authorization: `Bearer ${RUN_TOKEN}` })).status).toBe(429)
	})
})

describe('parcours complet avec le moteur réel', () => {
	test('création, confirmation, annonce, désinscription', async () => {
		const mailer = new MemoryMailer()
		const items = [{ itemId: 'v1|1|0', title: 'Carter Derbi Euro 3 origine', price: { value: '89.00', currency: 'EUR' }, itemAffiliateWebUrl: 'https://www.ebay.fr/itm/1?campid=5338123456' }]
		const fetch = async (url: string) => (url.includes('oauth2') ? new Response('{"access_token":"jeton-application-1234","expires_in":7200}') : new Response(JSON.stringify({ itemSummaries: items })))
		const s = setup({
			mailer,
			fetch,
			config: { ebay: { clientId: 'id-test', clientSecret: 'secret-test', campaignId: '5338123456', marketplace: 'EBAY_FR', apiBase: 'https://api.ebay.com', categoryId: undefined, dailyBudget: 10 } }
		})
		const done = await createAndConfirm(s)
		const result = await s.ctx.run()
		expect(result).toMatchObject({ checked: 1, newMatches: 1, emailsSent: 1 })
		const digest = mailer.sent.at(-1)?.email
		expect(digest?.text).toContain('https://www.ebay.fr/itm/1?campid=5338123456')
		expect(digest?.text).toMatch(/89,00\s€/)
		const unsubscribe = new URL(digest?.headers['List-Unsubscribe']?.slice(1, -1) ?? '')
		await handleUnsubscribe(new Request(unsubscribe, { method: 'POST' }), unsubscribe, s.ctx)
		expect(s.ctx.store.getAlert(done.alert.id)).toBeUndefined()
		s.clock.advance(2 * HOUR)
		expect((await s.ctx.run()).emailsSent).toBe(0)
	})
})
