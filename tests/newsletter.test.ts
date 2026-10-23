import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MAX_SUBSCRIBERS, NewsletterStore, isValidUnsubscribeToken, normalizeEmail, unsubscribeToken } from '../src/alerts/newsletter'

const SECRET = 'secret-newsletter-0123456789-abcdefghijklmnop'
let dir: string
let file: string

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'newsletter-'))
	file = join(dir, 'data', 'newsletter.jsonl')
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('adresses', () => {
	it('normalise et refuse les adresses invalides', () => {
		expect(normalizeEmail('  Lucas@Exemple.FR ')).toBe('lucas@exemple.fr')
		expect(normalizeEmail('pas-un-mail')).toBeUndefined()
		expect(normalizeEmail(`${'a'.repeat(250)}@exemple.fr`)).toBeUndefined()
	})
})

describe('jeton de désinscription', () => {
	it("n'est valable que pour son adresse et son secret", () => {
		const token = unsubscribeToken(SECRET, 'a@exemple.fr')
		expect(isValidUnsubscribeToken(SECRET, 'a@exemple.fr', token)).toBe(true)
		expect(isValidUnsubscribeToken(SECRET, 'b@exemple.fr', token)).toBe(false)
		expect(isValidUnsubscribeToken(`${SECRET}x`, 'a@exemple.fr', token)).toBe(false)
		expect(isValidUnsubscribeToken(SECRET, 'a@exemple.fr', undefined)).toBe(false)
		expect(isValidUnsubscribeToken(SECRET, 'a@exemple.fr', 'x'.repeat(500))).toBe(false)
	})
})

describe('liste des abonnés', () => {
	it('ne duplique pas une adresse et répond pareil', async () => {
		const store = new NewsletterStore(file)
		expect(await store.subscribe('a@exemple.fr', new Date())).toBe('added')
		expect(await store.subscribe('a@exemple.fr', new Date())).toBe('exists')
		expect(readFileSync(file, 'utf8').trim().split('\n')).toHaveLength(1)
	})

	it('garde toutes les inscriptions simultanées', async () => {
		const store = new NewsletterStore(file)
		await Promise.all(Array.from({ length: 30 }, (_, i) => store.subscribe(`u${i}@exemple.fr`, new Date())))
		expect(readFileSync(file, 'utf8').trim().split('\n')).toHaveLength(30)
	})

	it('désinscrit seulement l’adresse demandée', async () => {
		const store = new NewsletterStore(file)
		await store.subscribe('a@exemple.fr', new Date())
		await store.subscribe('b@exemple.fr', new Date())
		expect(await store.unsubscribe('a@exemple.fr')).toBe(true)
		expect(await store.unsubscribe('a@exemple.fr')).toBe(false)
		expect(readFileSync(file, 'utf8')).toContain('b@exemple.fr')
		expect(readFileSync(file, 'utf8')).not.toContain('a@exemple.fr')
	})

	it('refuse au-delà du plafond', async () => {
		const store = new NewsletterStore(file)
		const rows = Array.from({ length: MAX_SUBSCRIBERS }, (_, i) => JSON.stringify({ email: `u${i}@exemple.fr`, consent: true, date: 'x' }))
		await new NewsletterStore(file).subscribe('seed@exemple.fr', new Date())
		const { writeFileSync } = await import('node:fs')
		writeFileSync(file, `${rows.join('\n')}\n`)
		expect(await store.subscribe('nouveau@exemple.fr', new Date())).toBe('full')
	})
})
