import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import type { APIRoute } from 'astro'

export const prerender = false

const DIR = 'data'
const FILE = `${DIR}/newsletter.jsonl`
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Inscription (opt-in explicite) et désinscription (GET ?email=...) à la newsletter
 */
export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData()
	const email = String(form.get('email') ?? '')
		.trim()
		.toLowerCase()
	if (!EMAIL.test(email) || email.length > 254 || form.get('consent') === null) {
		return new Response(null, { status: 400 })
	}
	await mkdir(DIR, { recursive: true })
	await appendFile(FILE, `${JSON.stringify({ email, consent: true, date: new Date().toISOString() })}\n`)
	return new Response(null, { status: 204 })
}

export const GET: APIRoute = async ({ url }) => {
	const email = (url.searchParams.get('email') ?? '').trim().toLowerCase()
	if (EMAIL.test(email)) {
		const lines = (await readFile(FILE, 'utf8').catch(() => '')).split('\n').filter((l) => l && !l.includes(JSON.stringify(email)))
		await writeFile(FILE, lines.length ? `${lines.join('\n')}\n` : '')
	}
	return new Response('Vous êtes désinscrit(e) de la newsletter Trouve ta pièce.', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	})
}
