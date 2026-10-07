import { describe, expect, test } from 'vitest'
import { type CtResult, buildIcs, computeCt, googleCalendarUrl, parseIsoDate, reminderFor, toIsoDate } from '../src/libs/controleTechnique'

const today = parseIsoDate('2026-10-07') as Date

function deadlineOf(registration: string, last?: string, collection?: boolean): string {
	const result = computeCt({ firstRegistration: parseIsoDate(registration), lastInspection: parseIsoDate(last), collection }, today)
	return result.kind === 'echeance' ? toIsoDate(result.deadline) : result.kind
}

describe('computeCt', () => {
	test('2020-2021 : 4 mois après la date anniversaire, plafond au 31 décembre 2026', () => {
		expect(deadlineOf('2020-03-12')).toBe('2026-07-12')
		expect(deadlineOf('2020-06-15')).toBe('2026-10-15')
		expect(deadlineOf('2021-11-08')).toBe('2026-12-31')
		expect(deadlineOf('2020-02-29')).toBe('2026-06-28')
	})

	test('avant 2017 : 14 août 2024 ou 4 mois après la date anniversaire', () => {
		expect(deadlineOf('2016-03-01')).toBe('2024-08-14')
		expect(deadlineOf('2016-05-20')).toBe('2024-09-20')
		expect(deadlineOf('2014-11-02')).toBe('2024-12-31')
	})

	test('2017-2019 et depuis 2022', () => {
		expect(deadlineOf('2018-09-15')).toBe('2025-12-31')
		expect(deadlineOf('2017-01-10')).toBe('2025-05-10')
		expect(deadlineOf('2022-09-01')).toBe('2027-09-01')
	})

	test('renouvellement à 3 ans, 5 ans en collection, dispense avant 1960', () => {
		expect(deadlineOf('2016-05-20', '2024-06-03')).toBe('2027-06-03')
		expect(deadlineOf('1975-04-01', '2024-06-03', true)).toBe('2029-06-03')
		expect(deadlineOf('1955-04-01', undefined, true)).toBe('dispense')
	})

	test('statut et erreurs de saisie', () => {
		const late = computeCt({ firstRegistration: parseIsoDate('2020-03-12') }, today)
		const soon = computeCt({ firstRegistration: parseIsoDate('2020-06-15') }, today)
		expect(late.kind === 'echeance' && late.status).toBe('retard')
		expect(soon.kind === 'echeance' && soon.status).toBe('proche')
		expect(deadlineOf('2027-01-01')).toBe('erreur')
		expect(deadlineOf('2020-03-12', '2019-01-01')).toBe('erreur')
		expect(deadlineOf('')).toBe('vide')
	})
})

describe('rappels', () => {
	const result = computeCt({ firstRegistration: parseIsoDate('2021-11-08') }, today) as Extract<CtResult, { kind: 'echeance' }>

	test('le rappel agenda tombe 30 jours avant la date limite', () => {
		const event = reminderFor('Derbi', result, today)
		expect(toIsoDate(event.day)).toBe('2026-12-01')
		expect(googleCalendarUrl(event)).toContain('dates=20261201%2F20261202')
	})

	test('le fichier .ics est valide et plié à 75 octets', () => {
		const ics = buildIcs('Derbi', result, today)
		expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
		expect(ics).toContain('DTSTART;VALUE=DATE:20261231')
		expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(3)
		for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
	})
})
