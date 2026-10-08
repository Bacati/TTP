import { handleUnsubscribe } from 'alerts/handlers'
import { getAlertsContext } from 'alerts/service'
import type { APIRoute } from 'astro'

export const prerender = false

export const ALL: APIRoute = async ({ request, url }) => {
	const ctx = getAlertsContext()
	if (!ctx) return new Response('Service indisponible', { status: 404 })
	return handleUnsubscribe(request, url, ctx)
}
