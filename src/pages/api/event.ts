import { socketIp } from 'alerts/http'
import type { APIRoute } from 'astro'

const MAX_BODY = 4096

/**
 * Plausible proxy
 */
export const POST: APIRoute = async ({ request }) => {
	// Refus avant lecture quand la taille annoncée dépasse la limite ; la lecture en flux est plafonnée ensuite.
	if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return new Response(null, { status: 413 })
	const body = await readCapped(request)
	if (body === undefined) return new Response(null, { status: 413 })

	try {
		const res = await fetch('https://plausible.io/api/event', {
			method: 'POST',
			headers: {
				'User-Agent': request.headers.get('User-Agent') ?? '',
				'X-Forwarded-For': socketIp(request) ?? '',
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

async function readCapped(request: Request): Promise<string | undefined> {
	if (!request.body) return ''
	const reader = request.body.getReader()
	const chunks: Array<Uint8Array> = []
	let size = 0
	for (;;) {
		const { done, value } = await reader.read()
		if (done) break
		size += value.byteLength
		if (size > MAX_BODY) {
			await reader.cancel()
			return undefined
		}
		chunks.push(value)
	}
	return Buffer.concat(chunks).toString('utf-8')
}
