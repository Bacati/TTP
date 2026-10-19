import type { APIRoute } from 'astro'

const MAX_BODY = 4096

/**
 * Plausible proxy
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
	const body = await request.text()
	if (body.length > MAX_BODY) return new Response(null, { status: 413 })

	try {
		const res = await fetch('https://plausible.io/api/event', {
			method: 'POST',
			headers: {
				'User-Agent': request.headers.get('User-Agent') ?? '',
				'X-Forwarded-For': clientAddress,
				'Content-Type': 'application/json'
			},
			body,
			signal: AbortSignal.timeout(5000)
		})
		return new Response(await res.text(), { status: res.status })
	} catch {
		return new Response(null, { status: 502 })
	}
}
