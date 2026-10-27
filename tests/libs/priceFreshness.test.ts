import { describe, expect, test } from 'vitest'
import { PRICE_MAX_AGE_DAYS, formatCheckedAt, isPriceFresh, priceAgeDays } from '../../src/libs/priceFreshness'

const day = (iso: string) => new Date(`${iso}T00:00:00Z`)
const now = day('2026-10-28')

describe('priceAgeDays', () => {
	test('jours entiers écoulés', () => {
		expect(priceAgeDays(day('2026-10-28'), now)).toBe(0)
		expect(priceAgeDays(day('2026-10-18'), now)).toBe(10)
		expect(priceAgeDays(day('2026-10-29'), now)).toBe(-1)
	})
})

describe('isPriceFresh', () => {
	test('date absente ou invalide : prix masqué', () => {
		expect(isPriceFresh(undefined, now)).toBe(false)
		expect(isPriceFresh(new Date('pas une date'), now)).toBe(false)
	})

	test('relevé récent : prix affiché, y compris le jour même et à la limite', () => {
		expect(isPriceFresh(day('2026-10-28'), now)).toBe(true)
		expect(isPriceFresh(day('2026-08-29'), now)).toBe(true)
		expect(priceAgeDays(day('2026-08-29'), now)).toBe(PRICE_MAX_AGE_DAYS)
	})

	test('relevé trop ancien : prix masqué', () => {
		expect(isPriceFresh(day('2026-08-28'), now)).toBe(false)
	})

	test('un jour d\'avance toléré (fuseau horaire), pas davantage', () => {
		expect(isPriceFresh(day('2026-10-29'), now)).toBe(true)
		expect(isPriceFresh(day('2026-10-30'), now)).toBe(false)
	})

	test('seuil personnalisé', () => {
		expect(isPriceFresh(day('2026-10-20'), now, 7)).toBe(false)
		expect(isPriceFresh(day('2026-10-22'), now, 7)).toBe(true)
	})
})

describe('formatCheckedAt', () => {
	test('format français JJ/MM/AAAA', () => {
		expect(formatCheckedAt(day('2026-10-28'))).toBe('28/10/2026')
		expect(formatCheckedAt(day('2026-01-05'))).toBe('05/01/2026')
	})
})
