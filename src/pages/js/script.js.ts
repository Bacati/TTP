import type { APIRoute } from 'astro'

const SOURCE = 'https://plausible.io/js/script.outbound-links.tagged-events.js'
const TTL = 6 * 3600_000

let cache: { body: string; at: number } | undefined

/**
 * Plausible proxy (script mis en cache 6 h : pas d'appel sortant à chaque visite)
 */
export const GET: APIRoute = async () => {
	if (!cache || Date.now() - cache.at > TTL) {
		try {
			const res = await fetch(SOURCE, { signal: AbortSignal.timeout(5000) })
			if (res.ok) cache = { body: await res.text(), at: Date.now() }
		} catch {
			// on garde l'éventuelle copie périmée plutôt que de casser la page
		}
	}
	if (!cache) return new Response('', { status: 502 })
	return new Response(cache.body, {
		status: 200,
		headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=21600' }
	})
}
