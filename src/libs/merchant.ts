/**
 * Nom du marchand affiché sur le bouton d'une fiche produit, déduit de l'hôte du lien affilié.
 * Fonction pure (sans `astro:content`) pour rester testable seule.
 */
const KNOWN_MERCHANTS: Array<{ test: RegExp; name: string }> = [
	{ test: /^(amzn\.to|link\.amazon|amazon\.[a-z.]+)$/, name: 'Amazon' },
	{ test: /(^|\.)mucoff\./, name: 'Muc-Off' },
	{ test: /^mycover-protection\.com$/, name: 'Mycover Protection' },
	{ test: /^flushfasteners\.com$/, name: 'Flush Fasteners' }
]

export function merchantOf(url: string): string {
	let host: string
	try {
		host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
	} catch {
		return 'le site du vendeur'
	}
	return KNOWN_MERCHANTS.find((m) => m.test.test(host))?.name ?? host
}
