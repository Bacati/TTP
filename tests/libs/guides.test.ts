import { describe, expect, test } from 'vitest'
import { buildToc, countWords, formatGuideDate, isoDate, readingMinutes } from '../../src/libs/guides'

const headings = [
	{ depth: 2, slug: 'ce-que-dit-la-loi', text: 'Ce que dit la loi' },
	{ depth: 3, slug: 'un-cyclomoteur', text: 'Un cyclomoteur' },
	{ depth: 2, slug: 'assurance', text: 'Assurance' }
]

describe('buildToc', () => {
	test('garde les h2 puis ajoute les sections du layout', () => {
		expect(buildToc(headings, { hasProducts: true }).map((i) => i.slug)).toEqual(['ce-que-dit-la-loi', 'assurance', 'outils', 'sources'])
	})

	test('sans produits : pas de section outils', () => {
		expect(buildToc(headings, { hasProducts: false }).map((i) => i.slug)).toEqual(['ce-que-dit-la-loi', 'assurance', 'sources'])
	})
})

describe('dates', () => {
	test('date YAML (minuit UTC) formatée sans décalage de jour', () => {
		const d = new Date('2026-10-27T00:00:00.000Z')
		expect(formatGuideDate(d)).toBe('27 octobre 2026')
		expect(isoDate(d)).toBe('2026-10-27')
	})
})

describe('temps de lecture', () => {
	test('ignore la syntaxe Markdown, le HTML et les URL des liens', () => {
		expect(countWords('## Titre\n\n<div class="callout">\n\n**Un** mot, [un lien](https://exemple.fr/a-b-c) - fin.\n\n</div>')).toBe(6)
	})

	test('arrondi à la minute supérieure, minimum 1', () => {
		expect(readingMinutes('')).toBe(1)
		expect(readingMinutes(Array(201).fill('mot').join(' '))).toBe(2)
	})
})
