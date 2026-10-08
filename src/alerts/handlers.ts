import { type AlertsConfig, CONSENT_VERSION } from './config'
import { confirmationEmail } from './emails'
import { type RateLimiter, clientIp, isSameOrigin } from './http'
import type { Links } from './links'
import type { Mailer } from './mailer'
import type { RunSummary } from './runner'
import type { AlertStore, StoredAlert } from './store'
import { maskEmail } from './text'
import { safeEqual, signToken, verifyToken } from './tokens'
import { type AlertField, type FormValues, parseAlertForm } from './validation'

export interface AlertsContext {
	config: AlertsConfig
	store: AlertStore
	mailer: Mailer
	links: Links
	limiter: RateLimiter
	now: () => number
	log: (message: string) => void
	run: () => Promise<RunSummary>
}

const EMPTY_VALUES: FormValues = { email: '', query: '', reference: '', maxPrice: '' }

export type CreateView = { state: 'form'; status: number; formToken: string; values: FormValues; errors: Partial<Record<AlertField | 'form', string>> } | { state: 'sent'; status: number }

async function readForm(request: Request): Promise<FormData | undefined> {
	const type = request.headers.get('content-type') ?? ''
	if (!(type.startsWith('application/x-www-form-urlencoded') || type.startsWith('multipart/form-data'))) return undefined
	const length = Number(request.headers.get('content-length') ?? '0')
	if (length > 20000) return undefined
	try {
		return await request.formData()
	} catch {
		return undefined
	}
}

export function formToken(ctx: AlertsContext): string {
	const now = ctx.now()
	return signToken(ctx.config.secret, 'form', Math.floor(now / 1000), now + ctx.config.limits.formMaxAgeMs)
}

export async function handleCreate(request: Request, clientAddress: string | undefined, ctx: AlertsContext): Promise<CreateView> {
	const { config, store } = ctx
	const limits = config.limits
	const view = (status: number, values: FormValues, errors: Partial<Record<AlertField | 'form', string>>): CreateView => ({
		state: 'form',
		status,
		formToken: formToken(ctx),
		values,
		errors
	})
	if (request.method !== 'POST') return view(200, EMPTY_VALUES, {})
	const now = ctx.now()
	if (!isSameOrigin(request, config.siteUrl)) return view(403, EMPTY_VALUES, { form: 'Requête refusée. Rechargez la page puis réessayez.' })
	if (!ctx.limiter.allow(`create:${clientIp(request, clientAddress, config.trustProxy)}`, now)) {
		return view(429, EMPTY_VALUES, { form: 'Trop de demandes depuis votre connexion. Réessayez dans quelques minutes.' })
	}
	const form = await readForm(request)
	if (!form) return view(400, EMPTY_VALUES, { form: 'Formulaire illisible. Rechargez la page puis réessayez.' })
	const honeypot = form.get('site_web')
	if (typeof honeypot === 'string' && honeypot.trim() !== '') return { state: 'sent', status: 200 }
	const issued = verifyToken(config.secret, 'form', form.get('jeton'), now)
	const parsed = parseAlertForm(form)
	if (issued === undefined) return view(400, parsed.values, { form: 'Le formulaire a expiré. Vérifiez vos informations puis renvoyez-le.' })
	if (now - issued * 1000 < limits.formMinDelayMs) return { state: 'sent', status: 200 }
	if (!parsed.ok) return view(400, parsed.values, parsed.errors)

	const result = store.createPendingAlert(parsed.value, now, CONSENT_VERSION, limits)
	if (!result.created) {
		ctx.log(`[alertes] création refusée (${result.reason}) pour ${maskEmail(parsed.value.email)}`)
		return { state: 'sent', status: 200 }
	}
	const expiresAt = now + limits.pendingTtlMs
	const email = confirmationEmail({
		query: parsed.value.query,
		reference: parsed.value.reference,
		maxPriceCents: parsed.value.maxPriceCents,
		confirmUrl: ctx.links.confirm(result.alert.id, expiresAt),
		expiresAt,
		sender: { postalAddress: config.postalAddress }
	})
	try {
		await ctx.mailer.send(parsed.value.email, email)
	} catch (error) {
		ctx.log(`[alertes] e-mail de confirmation en échec : ${(error as Error).message}`)
		if (!result.reused) store.deleteAlert(result.alert.subscriberId, result.alert.id)
		return view(503, parsed.values, { form: 'L’e-mail de confirmation n’a pas pu partir. Réessayez dans quelques minutes.' })
	}
	store.recordEmail(result.alert.subscriberId, 'confirm', now)
	return { state: 'sent', status: 200 }
}

export type ConfirmView =
	| { state: 'invalid'; status: number }
	| { state: 'ask'; status: number; token: string; alert: StoredAlert }
	| { state: 'done'; status: number; alert: StoredAlert; manageUrl: string }

export async function handleConfirm(request: Request, url: URL, ctx: AlertsContext): Promise<ConfirmView> {
	const now = ctx.now()
	const post = request.method === 'POST'
	const form = post ? await readForm(request) : undefined
	const token = post ? form?.get('t') : url.searchParams.get('t')
	const alertId = verifyToken(ctx.config.secret, 'confirm', token, now)
	const alert = alertId === undefined ? undefined : ctx.store.getAlert(alertId)
	if (!alert || typeof token !== 'string') return { state: 'invalid', status: 400 }
	if (alert.status === 'active') return { state: 'done', status: 200, alert, manageUrl: ctx.links.manage(alert.subscriberId) }
	if (!post) return { state: 'ask', status: 200, token, alert }
	if (!isSameOrigin(request, ctx.config.siteUrl)) return { state: 'invalid', status: 403 }
	const activated = ctx.store.activateAlert(alert.id, now, ctx.config.limits.alertTtlMs)
	if (!activated) return { state: 'invalid', status: 409 }
	ctx.log(`[alertes] alerte ${activated.id} activée`)
	return { state: 'done', status: 200, alert: activated, manageUrl: ctx.links.manage(activated.subscriberId) }
}

export type ManageView =
	| { state: 'invalid'; status: number }
	| { state: 'empty'; status: number }
	| { state: 'list'; status: number; token: string; maskedEmail: string; alerts: Array<StoredAlert>; notice: string | undefined }

function applyManageAction(form: FormData, subscriberId: number, now: number, ctx: AlertsContext): string | 'deleted' | undefined {
	const action = form.get('action')
	const alertId = Number(form.get('alerte'))
	if (action === 'tout-supprimer') {
		ctx.store.deleteSubscriber(subscriberId)
		return 'deleted'
	}
	if (!Number.isSafeInteger(alertId)) return undefined
	if (action === 'supprimer') return ctx.store.deleteAlert(subscriberId, alertId) ? 'Alerte supprimée.' : 'Cette alerte n’existe plus.'
	if (action === 'prolonger') {
		return ctx.store.extendAlert(subscriberId, alertId, now, ctx.config.limits.alertTtlMs) ? 'Alerte prolongée de 6 mois.' : 'Cette alerte ne peut pas être prolongée.'
	}
	return undefined
}

export async function handleManage(request: Request, url: URL, ctx: AlertsContext): Promise<ManageView> {
	const now = ctx.now()
	const post = request.method === 'POST'
	const form = post ? await readForm(request) : undefined
	const token = post ? form?.get('t') : url.searchParams.get('t')
	const subscriberId = verifyToken(ctx.config.secret, 'sub', token, now)
	if (subscriberId === undefined || typeof token !== 'string') return { state: 'invalid', status: 400 }
	let notice: string | undefined
	if (post) {
		if (!(form && isSameOrigin(request, ctx.config.siteUrl))) return { state: 'invalid', status: 403 }
		const outcome = applyManageAction(form, subscriberId, now, ctx)
		if (outcome === 'deleted') return { state: 'empty', status: 200 }
		if (outcome === undefined) return { state: 'invalid', status: 400 }
		notice = outcome
	}
	const email = ctx.store.subscriberEmail(subscriberId)
	if (!email) return { state: 'empty', status: 200 }
	return { state: 'list', status: 200, token, maskedEmail: maskEmail(email), alerts: ctx.store.listAlerts(subscriberId), notice }
}

export async function handleUnsubscribe(request: Request, url: URL, ctx: AlertsContext): Promise<Response> {
	const token = url.searchParams.get('t')
	const subscriberId = verifyToken(ctx.config.secret, 'sub', token, ctx.now())
	if (request.method === 'GET') {
		const location = subscriberId === undefined || !token ? '/alertes' : `/alertes/gerer?t=${encodeURIComponent(token)}`
		return new Response(null, {
			status: 303,
			headers: [
				['Location', location],
				['Cache-Control', 'no-store']
			]
		})
	}
	if (request.method !== 'POST') return new Response('Méthode non autorisée', { status: 405, headers: [['Allow', 'GET, POST']] })
	if (subscriberId === undefined) return new Response('Lien de désinscription invalide.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
	ctx.store.deleteSubscriber(subscriberId)
	ctx.log(`[alertes] désinscription du contact ${subscriberId}`)
	return new Response('Désinscription effectuée : vos alertes et votre adresse ont été supprimées.', {
		status: 200,
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
	})
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })

export async function handleRun(request: Request, clientAddress: string | undefined, ctx: AlertsContext): Promise<Response> {
	if (request.method !== 'POST') return json(405, { error: 'méthode non autorisée' })
	if (!ctx.limiter.allow(`run:${clientIp(request, clientAddress, ctx.config.trustProxy)}`, ctx.now())) return json(429, { error: 'trop de requêtes' })
	const header = request.headers.get('authorization') ?? ''
	const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
	if (!(token && safeEqual(token, ctx.config.runToken))) return json(401, { error: 'non autorisé' })
	const summary = await ctx.run()
	return json(summary.status === 'busy' ? 409 : 200, summary)
}
