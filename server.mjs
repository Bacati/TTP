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

const server = createServer((req, res) => {
	// IP de la connexion TCP, écrasée à chaque requête : le client ne peut pas la forger
	// (X-Forwarded-For, lui, est fourni par le client tant qu'aucun proxy de confiance ne le réécrit).
	req.headers[SOCKET_IP_HEADER] = req.socket.remoteAddress ?? ''
	for (const [key, value] of Object.entries(HEADERS)) res.setHeader(key, value)
	handler(req, res)
})

server.listen(port, host, () => console.log(`Serveur démarré sur http://${host}:${port}`))

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => server.close(() => process.exit(0)))
}
