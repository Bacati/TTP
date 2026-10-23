import { RateLimiter, clientIp, isSameOrigin, socketIp } from 'alerts/http'
import { NewsletterStore, isValidUnsubscribeToken, normalizeEmail } from 'alerts/newsletter'
import type { APIRoute } from 'astro'

export const prerender = false

const store = new NewsletterStore()
const limiter = new RateLimiter(15 * 60 * 1000, 5)
const siteUrl = () => process.env.SITE_URL ?? 'https://trouve-ta-piece.fr'

/**
 * Inscription (opt-in explicite) : même origine, 5 essais par IP et par quart d'heure,
 * réponse identique que l'adresse soit déjà inscrite ou non.
 */
export const POST: APIRoute = async ({ request }) => {
	if (!isSameOrigin(request, siteUrl())) return new Response(null, { status: 403 })
	if (!limiter.allow(`newsletter:${clientIp(request, socketIp(request), process.env.TRUST_PROXY === 'true')}`, Date.now())) {
		return new Response(null, { status: 429 })
	}
	const form = await request.formData().catch(() => undefined)
	const email = normalizeEmail(form?.get('email'))
	if (!email || form?.get('consent') == null) return new Response(null, { status: 400 })
	if ((await store.subscribe(email, new Date())) === 'full') return new Response(null, { status: 503 })
	return new Response(null, { status: 204 })
}

/**
 * Désinscription : le lien (?email=...&t=...) porte un jeton signé avec ALERTS_SECRET,
 * pour que personne ne puisse désinscrire une adresse qui n'est pas la sienne.
 * Les liens se génèrent avec `npm run newsletter:lien -- adresse@exemple.fr`.
 */
export const GET: APIRoute = async ({ url }) => {
	const secret = process.env.ALERTS_SECRET ?? ''
	if (secret.length < 32) return new Response('Service indisponible', { status: 503 })
	const email = normalizeEmail(url.searchParams.get('email'))
	if (!(email && isValidUnsubscribeToken(secret, email, url.searchParams.get('t')))) {
		return new Response('Lien de désinscription invalide.', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
	}
	await store.unsubscribe(email)
	return new Response('Vous êtes désinscrit(e) de la newsletter Trouve ta pièce.', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
	})
}
