import { describe, expect, test } from 'vitest'
import { csvRecords, parseCsv } from '../src/alerts/csv'
import { compactReference, escapeHtml, formatPrice, headerSafe, isHttpsUrl, keywords, maskEmail, normalizeText, parsePriceCents, stripControl, titleMatches } from '../src/alerts/text'
import { normalizeEmail, parseAlertForm } from '../src/alerts/validation'

const form = (fields: Record<string, string>) => {
	const data = new FormData()
	for (const [key, value] of Object.entries(fields)) data.set(key, value)
	return data
}

const VALID = { email: 'Lucas@Example.fr', query: 'Carter Derbi Euro 3', reference: '', maxPrice: '150', consent: 'oui' }

describe('normalisation du texte', () => {
	test('accents, casse et ponctuation', () => {
		expect(normalizeText('Échappement « Bidalot » 70cc !')).toBe('echappement bidalot 70cc')
		expect(compactReference('00H-012.050 41')).toBe('00h01205041')
		expect(keywords('cylindre pour la Derbi de 2006')).toEqual(['cylindre', 'derbi', '2006'])
	})

	test('correspondance de titre par mots-clés', () => {
		expect(titleMatches('Cylindre AIRSAL 70cc pour Derbi Senda', 'cylindre airsal derbi', undefined)).toBe(true)
		expect(titleMatches('Cylindres Airsal', 'cylindre airsal', undefined)).toBe(true)
		expect(titleMatches('Piston Airsal', 'cylindre airsal', undefined)).toBe(false)
		expect(titleMatches('Carter Derbi', 'de la', undefined)).toBe(false)
		expect(titleMatches('Kit de 70', 'de 70', undefined)).toBe(true)
	})

	test('correspondance par référence', () => {
		expect(titleMatches('Carter embrayage 00H01205041 Derbi', 'carter', '00H-012-050-41')).toBe(true)
		expect(titleMatches('Carter embrayage Derbi', 'carter', '00H01205041')).toBe(false)
		expect(titleMatches('ab', 'x', 'a-b')).toBe(false)
	})

	test('suppression des caractères invisibles et de contrôle', () => {
		expect(stripControl('Car​ter‮ Derbi\r\nBcc: x')).toBe('Car ter Derbi Bcc: x')
		expect(stripControl('\u0000\u0007 ok ﻿')).toBe('ok')
		expect(headerSafe('Objet\r\nBcc: pirate@exemple.com')).toBe('Objet Bcc: pirate@exemple.com')
		expect(headerSafe('a'.repeat(300), 20)).toHaveLength(20)
	})

	test('échappement HTML', () => {
		expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe('&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;')
	})

	test('lecture des prix', () => {
		expect(parsePriceCents('150')).toBe(15000)
		expect(parsePriceCents('1 200,50 €')).toBe(120050)
		expect(parsePriceCents('12.5')).toBe(1250)
		expect(parsePriceCents('12,345')).toBeUndefined()
		expect(parsePriceCents('-5')).toBeUndefined()
		expect(parsePriceCents('1e3')).toBeUndefined()
		expect(parsePriceCents('abc')).toBeUndefined()
		expect(parsePriceCents('')).toBeUndefined()
		expect(formatPrice(4550)).toMatch(/45,50\s€/)
		expect(formatPrice(null)).toBe('Prix non communiqué')
		expect(formatPrice(1000, 'XXX1')).toBe('10.00 XXX1')
	})

	test('URL https uniquement, sans identifiants', () => {
		expect(isHttpsUrl('https://www.ebay.fr/itm/1')).toBe(true)
		expect(isHttpsUrl('http://www.ebay.fr/itm/1')).toBe(false)
		expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
		expect(isHttpsUrl('https://user:pass@ebay.fr/')).toBe(false)
		expect(isHttpsUrl('https://ebay.fr.evil.com/', /(^|\.)ebay\.fr$/)).toBe(false)
		expect(isHttpsUrl(`https://ebay.fr/${'a'.repeat(3000)}`)).toBe(false)
		expect(isHttpsUrl(42)).toBe(false)
	})

	test('masquage des adresses dans les journaux', () => {
		expect(maskEmail('lucas@example.fr')).toBe('lu***@example.fr')
	})
})

describe('validation des adresses e-mail', () => {
	test('adresses acceptées', () => {
		expect(normalizeEmail('  Lucas.Lievre+moto@Example.FR ')).toBe('lucas.lievre+moto@example.fr')
		expect(normalizeEmail('a@b.co')).toBe('a@b.co')
		expect(normalizeEmail('x@xn--pices-6ra.fr')).toBe('x@xn--pices-6ra.fr')
	})

	test('adresses refusées', () => {
		const refused = [
			'',
			'lucas',
			'lucas@example',
			'@example.fr',
			'lucas@.fr',
			'.lucas@example.fr',
			'lucas.@example.fr',
			'lu..cas@example.fr',
			'lucas@exa_mple.fr',
			'lucas@example.fr\r\nBcc: pirate@exemple.com',
			'lucas@example.fr,pirate@exemple.com',
			'"lucas"@example.fr',
			'lucàs@example.fr',
			`${'a'.repeat(65)}@example.fr`,
			`a@${'b'.repeat(250)}.fr`,
			'lucas@example.1'
		]
		for (const value of refused) expect(normalizeEmail(value), value).toBeUndefined()
	})
})

describe('lecture du formulaire', () => {
	test('formulaire complet valide', () => {
		const result = parseAlertForm(form({ ...VALID, reference: '00H-012 050/41' }))
		expect(result.ok && result.value).toEqual({ email: 'lucas@example.fr', query: 'Carter Derbi Euro 3', reference: '00H-012 050/41', maxPriceCents: 15000 })
		expect(result.values.email).toBe('Lucas@Example.fr')
	})

	test('champs facultatifs vides', () => {
		const result = parseAlertForm(form({ ...VALID, maxPrice: '' }))
		expect(result.ok && result.value.maxPriceCents).toBeUndefined()
		expect(result.ok && result.value.reference).toBeUndefined()
	})

	test('erreurs par champ et valeurs conservées', () => {
		const result = parseAlertForm(form({ email: 'pas-un-mail', query: 'de', reference: '<script>', maxPrice: '-3', consent: '' }))
		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(Object.keys(result.errors).sort()).toEqual(['consent', 'email', 'maxPrice', 'query', 'reference'])
		expect(result.values.reference).toBe('<script>')
	})

	test('requête faite uniquement de mots vides', () => {
		const result = parseAlertForm(form({ ...VALID, query: 'de la des' }))
		expect(!result.ok && result.errors.query).toBeTruthy()
	})

	test('les caractères de contrôle sont nettoyés et les entrées géantes tronquées', () => {
		const result = parseAlertForm(form({ ...VALID, query: `Carter\u0000‮ Derbi${'x'.repeat(5000)}` }))
		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.values.query.length).toBeLessThanOrEqual(200)
		expect(result.values.query.includes('\u0000')).toBe(false)
		expect(result.values.query.includes('\u202e')).toBe(false)
		const clean = parseAlertForm(form({ ...VALID, query: 'Carter\u0000 Derbi' }))
		expect(clean.ok && clean.value.query).toBe('Carter Derbi')
	})

	test('bornes du prix', () => {
		expect(parseAlertForm(form({ ...VALID, maxPrice: '0,50' })).ok).toBe(false)
		expect(parseAlertForm(form({ ...VALID, maxPrice: '100000' })).ok).toBe(true)
		expect(parseAlertForm(form({ ...VALID, maxPrice: '100001' })).ok).toBe(false)
	})

	test('consentement exigé avec la valeur exacte', () => {
		expect(parseAlertForm(form({ ...VALID, consent: 'on' })).ok).toBe(false)
	})
})

describe('lecture CSV', () => {
	test('guillemets, guillemets échappés, retours à la ligne et délimiteurs dans les champs', () => {
		const text = 'id,titre,prix\r\n1,"Carter ""origine"", Derbi",12.5\n2,"Ligne 1\nLigne 2",3\r3,simple,\n'
		expect(parseCsv(text)).toEqual([
			['id', 'titre', 'prix'],
			['1', 'Carter "origine", Derbi', '12.5'],
			['2', 'Ligne 1\nLigne 2', '3'],
			['3', 'simple', '']
		])
	})

	test('BOM, lignes vides et lignes incomplètes', () => {
		const records = csvRecords('﻿id;titre;prix\n\n1;A;\n2\n', ';')
		expect(records).toEqual([
			{ id: '1', titre: 'A', prix: '' },
			{ id: '2', titre: '', prix: '' }
		])
	})

	test('tabulation et fichier vide', () => {
		expect(csvRecords('a\tb\n1\t2', '\t')).toEqual([{ a: '1', b: '2' }])
		expect(csvRecords('')).toEqual([])
		expect(parseCsv('"non fermé')).toEqual([['non fermé']])
	})
})
