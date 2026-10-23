import { describe, expect, test } from 'vitest'
import { safeEqual, signToken, verifyToken } from '../src/alerts/tokens'
import { SECRET, T0 } from './support/alertes'

describe('jetons signés', () => {
	test('aller-retour pour chaque type de jeton', () => {
		for (const kind of ['confirm', 'sub', 'form'] as const) {
			const token = signToken(SECRET, kind, 42, T0 + 60000)
			expect(verifyToken(SECRET, kind, token, T0)).toBe(42)
		}
	})

	test('un jeton sans expiration reste valable', () => {
		const token = signToken(SECRET, 'sub', 7, 0)
		expect(verifyToken(SECRET, 'sub', token, T0 + 10 * 365 * 86400000)).toBe(7)
	})

	test('un jeton expiré est refusé, à la seconde près', () => {
		const token = signToken(SECRET, 'confirm', 1, T0 + 1000)
		expect(verifyToken(SECRET, 'confirm', token, T0)).toBe(1)
		expect(verifyToken(SECRET, 'confirm', token, T0 + 1000)).toBeUndefined()
		expect(verifyToken(SECRET, 'confirm', token, T0 + 5000)).toBeUndefined()
	})

	test('un jeton d’un autre type est refusé', () => {
		const token = signToken(SECRET, 'confirm', 3, 0)
		expect(verifyToken(SECRET, 'sub', token, T0)).toBeUndefined()
		expect(verifyToken(SECRET, 'form', token, T0)).toBeUndefined()
	})

	test('toute modification invalide la signature', () => {
		const token = signToken(SECRET, 'sub', 5, 0)
		const [kind, subject, exp, sig] = token.split('.') as [string, string, string, string]
		const flipped = sig[0] === 'A' ? `B${sig.slice(1)}` : `A${sig.slice(1)}`
		expect(verifyToken(SECRET, 'sub', `${kind}.${subject}.${exp}.${flipped}`, T0)).toBeUndefined()
		expect(verifyToken(SECRET, 'sub', `${kind}.6.${exp}.${sig}`, T0)).toBeUndefined()
		expect(verifyToken(SECRET, 'sub', `${kind}.${subject}.9999999999.${sig}`, T0)).toBeUndefined()
		expect(verifyToken(SECRET, 'confirm', `confirm.${subject}.${exp}.${sig}`, T0)).toBeUndefined()
	})

	test('un autre secret ne valide pas le jeton', () => {
		const token = signToken(SECRET, 'sub', 5, 0)
		expect(verifyToken(`${SECRET}x`, 'sub', token, T0)).toBeUndefined()
	})

	test('les entrées malformées sont refusées sans exception', () => {
		const inputs: Array<unknown> = [
			undefined,
			null,
			42,
			{},
			'',
			'sub',
			'sub.1.0',
			'sub.1.0.abc',
			`sub.-1.0.${'a'.repeat(43)}`,
			`sub.1.0.${'a'.repeat(44)}`,
			`sub.1.0.${'+'.repeat(43)}`,
			`SUB.1.0.${'a'.repeat(43)}`,
			'x'.repeat(500),
			`sub.1.0.${'a'.repeat(43)}.extra`
		]
		for (const input of inputs) expect(verifyToken(SECRET, 'sub', input, T0)).toBeUndefined()
	})

	test('un secret trop court est refusé', () => {
		expect(() => signToken('court', 'sub', 1, 0)).toThrow()
		const token = signToken(SECRET, 'sub', 1, 0)
		expect(verifyToken('court', 'sub', token, T0)).toBeUndefined()
	})

	test('les sujets invalides sont refusés à la signature', () => {
		expect(() => signToken(SECRET, 'sub', -1, 0)).toThrow()
		expect(() => signToken(SECRET, 'sub', 1.5, 0)).toThrow()
		expect(() => signToken(SECRET, 'sub', Number.MAX_SAFE_INTEGER + 2, 0)).toThrow()
	})

	test('safeEqual compare sans fuite de longueur', () => {
		expect(safeEqual('abc', 'abc')).toBe(true)
		expect(safeEqual('abc', 'abd')).toBe(false)
		expect(safeEqual('abc', 'abcd')).toBe(false)
		expect(safeEqual('', '')).toBe(true)
	})
})
