import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { csvRecords, parseCsv } from '../src/alerts/csv'
import { confirmationEmail, digestEmail } from '../src/alerts/emails'
import { compileMatcher, escapeHtml, headerSafe, keywords, normalizeText, parsePriceCents, prepareTitle, stripControl, titleMatches } from '../src/alerts/text'
import { type TokenKind, signToken, verifyToken } from '../src/alerts/tokens'
import { normalizeEmail } from '../src/alerts/validation'
import { SECRET, SENDER, T0 } from './support/alertes'

const RUNS = { numRuns: 2000 }
const hostileText = fc.oneof(
	fc.string({ unit: 'binary', maxLength: 120 }),
	fc.string({ unit: 'grapheme', maxLength: 120 }),
	fc.constantFrom('<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', "' OR 1=1 --", 'a\r\nBcc: x@y.fr', '‮exe.txt', '\u0000\u0007\u001b[31m', '{{constructor}}', '__proto__')
)
const kinds: Array<TokenKind> = ['confirm', 'sub', 'form']
const unescapeHtml = (value: string) => value.replace(/&lt;|&gt;|&quot;|&#39;|&amp;/g, (entity) => ({ '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&amp;': '&' })[entity] ?? entity)
const csvField = (value: string, delimiter: string) => (/["\r\n]/.test(value) || value.includes(delimiter) || value === '' ? `"${value.replaceAll('"', '""')}"` : value)

describe('jetons signés', () => {
	test('aller-retour pour tout type, sujet et échéance future', () => {
		fc.assert(
			fc.property(fc.constantFrom(...kinds), fc.integer({ min: 0, max: 2 ** 40 }), fc.integer({ min: 1, max: 10 ** 9 }), (kind, subject, delay) => {
				const token = signToken(SECRET, kind, subject, T0 + delay * 1000)
				expect(verifyToken(SECRET, kind, token, T0)).toBe(subject)
				for (const other of kinds.filter((k) => k !== kind)) expect(verifyToken(SECRET, other, token, T0)).toBeUndefined()
				expect(verifyToken(`${SECRET}x`, kind, token, T0)).toBeUndefined()
				expect(verifyToken(SECRET, kind, token, T0 + delay * 1000 + 1000)).toBeUndefined()
			}),
			RUNS
		)
	})

	test('toute modification d’un caractère invalide le jeton', () => {
		const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.'
		fc.assert(
			fc.property(fc.integer({ min: 0, max: 10 ** 6 }), fc.nat(), fc.constantFrom(...alphabet), (subject, position, replacement) => {
				const token = signToken(SECRET, 'sub', subject, 0)
				const index = position % token.length
				if (token[index] === replacement) return
				const tampered = `${token.slice(0, index)}${replacement}${token.slice(index + 1)}`
				const result = verifyToken(SECRET, 'sub', tampered, T0)
				expect(result === undefined || (index === token.length - 1 && result === subject)).toBe(true)
			}),
			RUNS
		)
	})

	test('aucune entrée arbitraire ne fait planter la vérification', () => {
		fc.assert(
			fc.property(fc.anything(), (value) => {
				expect(verifyToken(SECRET, 'sub', value, T0)).toBeUndefined()
			}),
			RUNS
		)
	})
})

describe('échappement et en-têtes', () => {
	test('escapeHtml ne laisse aucun caractère actif et reste réversible', () => {
		fc.assert(
			fc.property(hostileText, (value) => {
				const escaped = escapeHtml(value)
				expect(escaped).not.toMatch(/[<>"']/)
				expect(unescapeHtml(escaped)).toBe(value)
			}),
			RUNS
		)
	})

	test('headerSafe ne laisse ni contrôle ni saut de ligne et respecte la longueur', () => {
		fc.assert(
			fc.property(hostileText, fc.integer({ min: 2, max: 200 }), (value, max) => {
				const header = headerSafe(value, max)
				expect(header).not.toMatch(/[\r\n\t]/)
				expect(stripControl(header)).toBe(header)
				expect(header.length).toBeLessThanOrEqual(max)
			}),
			RUNS
		)
	})

	test('l’objet des e-mails ne contient jamais de saut de ligne, et le HTML jamais de balise venue de l’utilisateur', () => {
		fc.assert(
			fc.property(hostileText, hostileText, (query, title) => {
				const confirm = confirmationEmail({ query, reference: undefined, maxPriceCents: undefined, confirmUrl: 'https://trouve-ta-piece.fr/alertes/confirmer?t=x', expiresAt: T0, sender: SENDER })
				const digest = digestEmail({
					groups: [{ query, expiresAt: null, items: [{ title, priceCents: 100, currency: 'EUR', url: 'https://www.ebay.fr/itm/1', imageUrl: null, condition: null, source: 'ebay', foundAt: T0 }] }],
					extraCount: 0,
					manageUrl: 'https://trouve-ta-piece.fr/alertes/gerer?t=x',
					unsubscribeUrl: 'https://trouve-ta-piece.fr/api/alertes/desinscription?t=x',
					now: T0,
					sender: SENDER
				})
				for (const email of [confirm, digest]) {
					expect(email.subject).not.toMatch(/[\r\n]/)
					expect(email.html).not.toMatch(/<script|<img src=x/i)
				}
				if (/[<>]/.test(title)) expect(digest.html).not.toContain(title)
			}),
			{ numRuns: 500 }
		)
	})
})

describe('normalisation et correspondance', () => {
	test('normalizeText est idempotent et ne produit que [a-z0-9 ]', () => {
		fc.assert(
			fc.property(hostileText, (value) => {
				const once = normalizeText(value)
				expect(normalizeText(once)).toBe(once)
				expect(once).toMatch(/^([a-z0-9]+( [a-z0-9]+)*)?$/)
			}),
			RUNS
		)
	})

	test('un titre qui contient tous les mots de la recherche correspond toujours', () => {
		const word = fc.stringMatching(/^[A-Za-zÀ-ÿ0-9]{2,12}$/)
		fc.assert(
			fc.property(fc.array(word, { minLength: 1, maxLength: 5 }), fc.array(word, { maxLength: 5 }), (wanted, noise) => {
				const query = wanted.join(' ')
				if (keywords(query).length === 0) return
				const title = [...noise, ...wanted.map((w) => w.toUpperCase())].join(' - ')
				expect(titleMatches(title, query, undefined)).toBe(true)
			}),
			RUNS
		)
	})

	test('une référence est retrouvée quels que soient les séparateurs', () => {
		fc.assert(
			fc.property(fc.stringMatching(/^[A-Z0-9]{3,12}$/), fc.constantFrom(' ', '-', '.', '/', ''), fc.string({ maxLength: 20 }), (reference, separator, noise) => {
				const spaced = reference.split('').join(separator)
				expect(compileMatcher('x', reference)(prepareTitle(`${noise} ${spaced.toLowerCase()} ${noise}`))).toBe(true)
			}),
			RUNS
		)
	})

	test('la correspondance ne plante sur aucune entrée', () => {
		fc.assert(
			fc.property(hostileText, hostileText, fc.option(hostileText, { nil: undefined }), (title, query, reference) => {
				expect(typeof titleMatches(title, query, reference)).toBe('boolean')
			}),
			RUNS
		)
	})
})

describe('CSV', () => {
	test('aller-retour : ce qui est écrit selon la RFC 4180 est relu à l’identique', () => {
		const cell = fc.string({ unit: 'grapheme', maxLength: 30 })
		fc.assert(
			fc.property(fc.constantFrom(',', ';', '\t', '|'), fc.integer({ min: 1, max: 6 }), fc.integer({ min: 1, max: 8 }), fc.constantFrom('\n', '\r\n'), (delimiter, width, height, newline) => {
				const rows = fc.sample(fc.array(cell, { minLength: width, maxLength: width }), height)
				const text = rows.map((row) => row.map((value) => csvField(value, delimiter)).join(delimiter)).join(newline)
				expect(parseCsv(text, delimiter)).toEqual(rows.filter((row) => !(row.length === 1 && row[0] === '')))
			}),
			{ numRuns: 500 }
		)
	})

	test('un en-tête __proto__ ou constructor ne pollue aucun objet', () => {
		const [record] = csvRecords('__proto__,constructor,title\n{"admin":true},x,Carter\n')
		expect(record?.title).toBe('Carter')
		expect(Object.getPrototypeOf(record)).toBeNull()
		expect(({} as Record<string, unknown>).admin).toBeUndefined()
	})

	test('aucune entrée arbitraire ne fait planter la lecture', () => {
		fc.assert(
			fc.property(fc.string({ unit: 'binary', maxLength: 300 }), fc.constantFrom(',', ';', '\t', '|'), (text, delimiter) => {
				expect(Array.isArray(csvRecords(text, delimiter))).toBe(true)
			}),
			RUNS
		)
	})
})

describe('prix et adresses', () => {
	test('tout prix écrit en euros est relu au centime près', () => {
		fc.assert(
			fc.property(fc.integer({ min: 0, max: 999999999 }), fc.constantFrom('.', ','), fc.constantFrom('', ' €', 'EUR', ' EUR'), (cents, separator, suffix) => {
				const text = `${Math.floor(cents / 100)}${separator}${String(cents % 100).padStart(2, '0')}${suffix}`
				expect(parsePriceCents(text)).toBe(cents)
			}),
			RUNS
		)
	})

	test('une adresse acceptée ne contient jamais d’espace, de chevron ni de saut de ligne, et reste stable', () => {
		fc.assert(
			fc.property(
				fc.oneof(
					fc.emailAddress(),
					hostileText,
					fc.emailAddress().map((e) => `${e}\r\nBcc: x@y.fr`)
				),
				(value) => {
					const email = normalizeEmail(value)
					if (email === undefined) return
					expect(email).not.toMatch(/[\s<>,;:"()[\]\\]/)
					expect(email.length).toBeLessThanOrEqual(254)
					expect(normalizeEmail(email)).toBe(email)
				}
			),
			RUNS
		)
	})
})
