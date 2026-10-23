import { describe, expect, test } from 'vitest'
import { type DigestItem, confirmationEmail, digestEmail, expiryEmail } from '../src/alerts/emails'
import { DAY, SENDER, T0 } from './support/alertes'

const MANAGE = 'https://trouve-ta-piece.fr/alertes/gerer?t=sub.1.0.abc'
const UNSUB = 'https://trouve-ta-piece.fr/api/alertes/desinscription?t=sub.1.0.abc'

const digestItem = (extra: Partial<DigestItem> = {}): DigestItem => ({
	title: 'Carter Derbi',
	priceCents: 4500,
	currency: 'EUR',
	url: 'https://www.ebay.fr/itm/1?campid=5338123456',
	imageUrl: 'https://i.ebayimg.com/1.jpg',
	condition: 'Occasion',
	source: 'ebay',
	foundAt: T0,
	...extra
})

describe('e-mail de confirmation', () => {
	test('contenu, lien et échappement', () => {
		const email = confirmationEmail({
			query: '<b>Carter</b>\r\nBcc: x@y.fr',
			reference: '00H01205041',
			maxPriceCents: 15000,
			confirmUrl: 'https://trouve-ta-piece.fr/alertes/confirmer?t=abc&x="',
			expiresAt: T0 + 2 * DAY,
			sender: SENDER
		})
		expect(email.subject).not.toMatch(/[\r\n]/)
		expect(email.subject).toContain('Confirmez votre alerte')
		expect(email.html).not.toContain('<b>Carter</b>')
		expect(email.html).toContain('&lt;b&gt;Carter&lt;/b&gt;')
		expect(email.html).toContain('href="https://trouve-ta-piece.fr/alertes/confirmer?t=abc&amp;x=&quot;"')
		expect(email.text).toContain('Référence : 00H01205041')
		expect(email.text).toMatch(/Prix maximum : 150,00\s€/)
		expect(email.text).toContain('ignorez ce message')
		expect(email.headers).toEqual({})
	})
})

describe('e-mail d’annonces', () => {
	test('une annonce : objet, lien affilié, mentions obligatoires et désinscription en un clic', () => {
		const email = digestEmail({
			groups: [{ query: 'Carter Derbi', expiresAt: T0 + 180 * DAY, items: [digestItem()] }],
			extraCount: 0,
			manageUrl: MANAGE,
			unsubscribeUrl: UNSUB,
			now: T0,
			sender: SENDER
		})
		expect(email.subject).toBe('Nouvelle annonce pour « Carter Derbi »')
		expect(email.headers).toEqual({ 'List-Unsubscribe': `<${UNSUB}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' })
		expect(email.html).toContain('href="https://www.ebay.fr/itm/1?campid=5338123456"')
		expect(email.html).toContain('liens affiliés')
		expect(email.html).toContain('Prix relevés le')
		expect(email.html).toContain(MANAGE)
		expect(email.text).toContain(UNSUB)
		expect(email.text).toMatch(/Carter Derbi — 45,00\s€ \(Occasion\) — eBay/)
	})

	test('plusieurs annonces et plusieurs alertes', () => {
		const one = digestEmail({
			groups: [{ query: 'Carter', expiresAt: null, items: [digestItem(), digestItem({ title: 'Autre' })] }],
			extraCount: 3,
			manageUrl: MANAGE,
			unsubscribeUrl: UNSUB,
			now: T0,
			sender: SENDER
		})
		expect(one.subject).toBe('2 annonces pour « Carter »')
		expect(one.text).toContain('Et 3 autre(s) annonce(s)')
		const many = digestEmail({
			groups: [
				{ query: 'Carter', expiresAt: null, items: [digestItem()] },
				{ query: 'Cylindre', expiresAt: null, items: [digestItem({ title: 'Cylindre' })] }
			],
			extraCount: 0,
			manageUrl: MANAGE,
			unsubscribeUrl: UNSUB,
			now: T0,
			sender: SENDER
		})
		expect(many.subject).toBe('2 nouvelles annonces pour vos alertes')
	})

	test('contenu d’annonce hostile neutralisé', () => {
		const email = digestEmail({
			groups: [
				{
					query: 'Carter',
					expiresAt: null,
					items: [
						digestItem({ title: '<img src=x onerror=alert(1)>', condition: '"><script>', imageUrl: 'javascript:alert(1)' }),
						digestItem({ title: 'Lien http', url: 'http://www.ebay.fr/itm/2' }),
						digestItem({ title: 'Lien javascript', url: 'javascript:alert(1)' })
					]
				}
			],
			extraCount: 0,
			manageUrl: MANAGE,
			unsubscribeUrl: UNSUB,
			now: T0,
			sender: SENDER
		})
		expect(email.html).not.toMatch(/<img src=x|<script>|javascript:/)
		expect(email.html).toContain('&lt;img src=x onerror=alert(1)&gt;')
		expect(email.text).not.toContain('Lien http')
		expect(email.text).not.toContain('javascript:')
		expect(email.subject).toBe('Nouvelle annonce pour « Carter »')
	})

	test('prix inconnu et source de flux', () => {
		const email = digestEmail({
			groups: [{ query: 'Kit', expiresAt: null, items: [digestItem({ priceCents: null, source: 'muc-off', imageUrl: null })] }],
			extraCount: 0,
			manageUrl: MANAGE,
			unsubscribeUrl: UNSUB,
			now: T0,
			sender: SENDER
		})
		expect(email.text).toContain('Prix non communiqué')
		expect(email.text).toContain('muc-off')
	})
})

describe('rappel d’expiration', () => {
	test('date, lien de prolongation et désinscription', () => {
		const email = expiryEmail({ query: 'Carter <x>', expiresAt: Date.UTC(2027, 3, 5, 12), manageUrl: MANAGE, unsubscribeUrl: UNSUB, sender: SENDER })
		expect(email.subject).toBe('Votre alerte « Carter <x> » expire bientôt')
		expect(email.html).toContain('Carter &lt;x&gt;')
		expect(email.text).toContain('5 avril 2027')
		expect(email.headers['List-Unsubscribe']).toBe(`<${UNSUB}>`)
	})
})
