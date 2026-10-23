import { defineMiddleware } from 'astro/middleware'
import { HEADERS } from '../../securityHeaders.mjs'

/**
 * En-têtes de sécurité des réponses HTML rendues par Astro.
 * Les pages prérendues et les assets reçoivent les mêmes en-têtes dans `server.mjs`.
 */
export default defineMiddleware(async (_context, next) => {
	const response = await next()
	const contentType = response.headers.get('content-type') ?? ''
	// nosniff partout (API, XML, JS), le reste uniquement sur le HTML (pas sur les assets immuables)
	response.headers.set('X-Content-Type-Options', 'nosniff')
	if (contentType.includes('text/html')) {
		for (const [key, value] of Object.entries(HEADERS)) {
			response.headers.set(key, value)
		}
	}
	return response
})
