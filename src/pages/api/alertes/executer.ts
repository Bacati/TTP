import { handleRun } from 'alerts/handlers'
import { socketIp } from 'alerts/http'
import { getAlertsContext } from 'alerts/service'
import type { APIRoute } from 'astro'

export const prerender = false

export const ALL: APIRoute = async ({ request }) => {
	const ctx = getAlertsContext()
	if (!ctx) return new Response('Service indisponible', { status: 404 })
	return handleRun(request, socketIp(request), ctx)
}
