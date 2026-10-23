// Génère le lien de désinscription signé d'une adresse : npm run newsletter:lien -- adresse@exemple.fr
// (ALERTS_SECRET et SITE_URL sont lus dans l'environnement, comme sur le serveur)
import { createHmac } from 'node:crypto'

const email = String(process.argv[2] ?? '')
	.trim()
	.toLowerCase()
const secret = process.env.ALERTS_SECRET ?? ''
const site = (process.env.SITE_URL ?? 'https://trouve-ta-piece.fr').replace(/\/$/, '')
if (!email.includes('@') || secret.length < 32) {
	console.error('Usage : ALERTS_SECRET=... npm run newsletter:lien -- adresse@exemple.fr (secret de 32 caractères minimum)')
	process.exit(1)
}
const token = createHmac('sha256', secret).update(`newsletter-unsubscribe:${email}`).digest('base64url')
console.log(`${site}/api/newsletter?email=${encodeURIComponent(email)}&t=${token}`)
