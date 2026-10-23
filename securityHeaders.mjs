/**
 * En-têtes de sécurité, partagés par le middleware Astro (pages rendues côté serveur)
 * et par `server.mjs` (pages prérendues et assets, que le middleware ne voit pas).
 * Gardés alignés avec `nginx.conf`.
 */
export const CSP = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"form-action 'self'",
	// Astro injecte des <style> de composant : 'unsafe-inline' requis pour le style.
	"style-src 'self' 'unsafe-inline'",
	"script-src 'self'",
	"img-src 'self' data:",
	"font-src 'self' data:",
	"connect-src 'self'",
	'upgrade-insecure-requests'
].join('; ')

export const HEADERS = {
	'Content-Security-Policy': CSP,
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Frame-Options': 'DENY',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), browsing-topics=()',
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
}
