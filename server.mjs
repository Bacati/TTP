// Serveur de production : l'adaptateur Node en mode standalone sans démarrage automatique,
// pour poser les en-têtes de sécurité sur TOUTES les réponses (pages prérendues et assets
// passent par le gestionnaire statique, qui ne lance pas le middleware Astro).
process.env.ASTRO_NODE_AUTOSTART = 'disabled'

import { createServer } from 'node:http'
import { HEADERS } from './securityHeaders.mjs'

const { handler } = await import('./dist/server/entry.mjs')

const SOCKET_IP_HEADER = 'x-ttp-socket-ip'
const port = process.env.PORT ? Number(process.env.PORT) : 3000
const host = process.env.HOST ?? '0.0.0.0'

// /_image redimensionne à la demande : une combinaison de paramètres = un traitement sharp.
// On plafonne par IP ; un cache (nginx, CDN) devant reste recommandé.
const IMAGE_WINDOW_MS = 60_000
const IMAGE_MAX = 300
const trustProxy = process.env.TRUST_PROXY === 'true'
const imageHits = new Map()

function imageAllowed(req) {
	const forwarded = trustProxy
		? String(req.headers['x-forwarded-for'] ?? '')
				.split(',')
				.pop()
				?.trim()
		: undefined
	const key = forwarded || req.socket.remoteAddress || 'inconnu'
	const now = Date.now()
	const entry = imageHits.get(key)
	if (!entry || now - entry.start > IMAGE_WINDOW_MS) {
		if (imageHits.size > 10000) imageHits.clear()
		imageHits.set(key, { start: now, count: 1 })
		return true
	}
	entry.count += 1
	return entry.count <= IMAGE_MAX
}

const server = createServer((req, res) => {
	// IP de la connexion TCP, écrasée à chaque requête : le client ne peut pas la forger
	// (X-Forwarded-For, lui, est fourni par le client tant qu'aucun proxy de confiance ne le réécrit).
	req.headers[SOCKET_IP_HEADER] = req.socket.remoteAddress ?? ''
	for (const [key, value] of Object.entries(HEADERS)) res.setHeader(key, value)
	if (req.url?.startsWith('/_image') && !imageAllowed(req)) {
		res.writeHead(429, { 'Retry-After': '60' })
		res.end()
		return
	}
	handler(req, res)
})

server.listen(port, host, () => console.log(`Serveur démarré sur http://${host}:${port}`))

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		server.close(() => process.exit(0))
		// une connexion longue ne doit pas retarder l'arrêt jusqu'au SIGKILL
		setTimeout(() => process.exit(1), 10000).unref()
	})
}
