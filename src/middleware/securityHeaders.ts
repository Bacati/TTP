import { defineMiddleware } from 'astro/middleware'

/**
 * En-têtes de sécurité appliqués à toutes les réponses HTML.
 * (Doublé dans `nginx.conf` pour les déploiements derrière nginx.)
 */
const CSP = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"form-action 'self'",
	// Astro injecte des <style> de composant : 'unsafe-inline' requis pour le style.
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"script-src 'self'",
	"img-src 'self' data:",
	"font-src 'self' https://fonts.gstatic.com data:",
	"connect-src 'self'",
	'upgrade-insecure-requests'
].join('; ')

const HEADERS: Record<string, string> = {
	'Content-Security-Policy': CSP,
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Frame-Options': 'DENY',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), browsing-topics=()',
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
}

export default defineMiddleware(async (_context, next) => {
	const response = await next()
	const contentType = response.headers.get('content-type') ?? ''
	// n'ajoute les en-têtes que sur le HTML (pas sur les assets immuables)
	if (contentType.includes('text/html')) {
		for (const [key, value] of Object.entries(HEADERS)) {
			response.headers.set(key, value)
		}
	}
	return response
})
