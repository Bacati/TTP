import { describe, expect, it } from 'vitest'
import { CSP, HEADERS } from '../securityHeaders.mjs'
import { clientIp, socketIp } from '../src/alerts/http'
import { parseAlertForm } from '../src/alerts/validation'

describe('IP client', () => {
	it("ignore X-Forwarded-For forgé quand le proxy n'est pas de confiance", () => {
		const request = new Request('https://exemple.test/', { headers: { 'x-forwarded-for': '198.51.100.9', 'x-ttp-socket-ip': '203.0.113.5' } })
		expect(clientIp(request, socketIp(request), false)).toBe('203.0.113.5')
	})

	it("renvoie 'inconnu' sans IP de connexion plutôt que l'IP forgée", () => {
		const request = new Request('https://exemple.test/', { headers: { 'x-forwarded-for': '198.51.100.9' } })
		expect(clientIp(request, socketIp(request), false)).toBe('inconnu')
	})

	it('lit la dernière adresse de X-Forwarded-For derrière un proxy de confiance', () => {
		const request = new Request('https://exemple.test/', { headers: { 'x-forwarded-for': '198.51.100.9, 203.0.113.77' } })
		expect(clientIp(request, undefined, true)).toBe('203.0.113.77')
	})
})

describe('en-têtes de sécurité partagés', () => {
	it('ne référencent plus Google Fonts et gardent frame-ancestors none', () => {
		expect(CSP).not.toContain('google')
		expect(CSP).toContain("frame-ancestors 'none'")
		expect(HEADERS['Strict-Transport-Security']).toContain('max-age')
	})
})

describe('requête libre', () => {
	const form = (query: string) => {
		const data = new FormData()
		for (const [key, value] of Object.entries({ email: 'a@exemple.fr', query, reference: '', maxPrice: '', consent: 'oui' })) data.set(key, value)
		return data
	}
	it.each(['visitez http://mal.example', 'gagnez sur www.arnaque', 'ecrire a x@y.fr', 'cadeau promo.com'])('refuse %s', (query) => {
		const result = parseAlertForm(form(query))
		expect(result.ok).toBe(false)
	})

	it('accepte une description normale', () => {
		expect(parseAlertForm(form('Carburateur Dell Orto PHBG 19')).ok).toBe(true)
	})
})
