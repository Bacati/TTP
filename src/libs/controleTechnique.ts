export const RULES_CHECKED_ON = '2026-10-07'

export const AMAZON_TAG = ''

export type CtStatus = 'retard' | 'proche' | 'ok'

export interface CtInput {
	firstRegistration: Date | undefined
	lastInspection?: Date | undefined
	collection?: boolean | undefined
}

export type CtResult =
	| { kind: 'vide' }
	| { kind: 'erreur'; message: string }
	| { kind: 'dispense'; rule: string }
	| {
			kind: 'echeance'
			deadline: Date
			opens: Date | undefined
			days: number
			status: CtStatus
			rule: string
			source: 'premier' | 'renouvellement'
			next: Array<Date>
	  }

export interface CalendarEvent {
	title: string
	day: Date
	details: string
}

const MS_PER_DAY = 86400000

const longDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })

export function makeDate(year: number, month: number, day: number): Date | undefined {
	const date = new Date(Date.UTC(year, month - 1, day))
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : undefined
}

export function parseIsoDate(value: string | null | undefined): Date | undefined {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
	if (!match) return undefined
	return makeDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

export function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10)
}

export function todayUtc(now = new Date()): Date {
	return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export const formatLong = (date: Date) => longDate.format(date)
export const formatShort = (date: Date) => shortDate.format(date)

function clampedDate(year: number, month: number, day: number): Date {
	const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
	return new Date(Date.UTC(year, month, Math.min(day, lastDay)))
}

export function addMonths(date: Date, months: number): Date {
	const total = date.getUTCMonth() + months
	const year = date.getUTCFullYear() + Math.floor(total / 12)
	const month = ((total % 12) + 12) % 12
	return clampedDate(year, month, date.getUTCDate())
}

export function addYears(date: Date, years: number): Date {
	return clampedDate(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate())
}

export function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * MS_PER_DAY)
}

const anniversary = (registration: Date, year: number) => clampedDate(year, registration.getUTCMonth(), registration.getUTCDate())
const earliest = (a: Date, b: Date) => (a < b ? a : b)
const yearEnd = (year: number) => new Date(Date.UTC(year, 11, 31))

function firstInspection(registration: Date): { deadline: Date; opens: Date | undefined; rule: string } {
	const year = registration.getUTCFullYear()
	if (year < 2017) {
		const birthday = anniversary(registration, 2024)
		if (birthday < new Date(Date.UTC(2024, 3, 15))) {
			return {
				deadline: new Date(Date.UTC(2024, 7, 14)),
				opens: undefined,
				rule: 'Immatriculé avant 2017, date anniversaire avant le 15 avril : premier contrôle au plus tard le 14 août 2024.'
			}
		}
		return {
			deadline: earliest(addMonths(birthday, 4), yearEnd(2024)),
			opens: undefined,
			rule: 'Immatriculé avant 2017 : premier contrôle dans les 4 mois suivant la date anniversaire de 2024, au plus tard le 31 décembre 2024.'
		}
	}
	if (year <= 2019) {
		return {
			deadline: earliest(addMonths(anniversary(registration, 2025), 4), yearEnd(2025)),
			opens: undefined,
			rule: 'Immatriculé entre 2017 et 2019 : premier contrôle dans les 4 mois suivant la date anniversaire de 2025, au plus tard le 31 décembre 2025.'
		}
	}
	if (year <= 2021) {
		return {
			deadline: earliest(addMonths(anniversary(registration, 2026), 4), yearEnd(2026)),
			opens: undefined,
			rule: 'Immatriculé en 2020 ou 2021 : premier contrôle dans les 4 mois suivant la date anniversaire de 2026, au plus tard le 31 décembre 2026.'
		}
	}
	const deadline = addYears(registration, 5)
	return {
		deadline,
		opens: addMonths(deadline, -6),
		rule: 'Immatriculé depuis 2022 : premier contrôle dans les 6 mois qui précèdent le 5e anniversaire de la mise en circulation.'
	}
}

export function computeCt(input: CtInput, today: Date): CtResult {
	const registration = input.firstRegistration
	if (!registration) return { kind: 'vide' }
	if (registration > today) return { kind: 'erreur', message: 'La date de 1re immatriculation est dans le futur.' }

	const period = input.collection ? 5 : 3
	if (input.collection && registration < new Date(Date.UTC(1960, 0, 1))) {
		return { kind: 'dispense', rule: 'Véhicule de collection mis en circulation avant 1960 : dispensé de contrôle technique.' }
	}

	let deadline: Date
	let opens: Date | undefined
	let rule: string
	let source: 'premier' | 'renouvellement' = 'premier'

	const last = input.lastInspection
	if (last) {
		if (last < registration) return { kind: 'erreur', message: 'Le dernier contrôle est antérieur à la 1re immatriculation.' }
		if (last > today) return { kind: 'erreur', message: 'La date du dernier contrôle est dans le futur.' }
		deadline = addYears(last, period)
		opens = undefined
		rule = `Renouvellement : ${period} ans après le contrôle favorable du ${formatLong(last)}.`
		source = 'renouvellement'
	} else {
		const first = firstInspection(registration)
		deadline = first.deadline
		opens = first.opens
		rule = first.rule
	}

	const days = Math.round((deadline.getTime() - today.getTime()) / MS_PER_DAY)
	const status: CtStatus = days < 0 ? 'retard' : days <= 60 ? 'proche' : 'ok'
	return { kind: 'echeance', deadline, opens, days, status, rule, source, next: [addYears(deadline, period), addYears(deadline, period * 2)] }
}

export function durationText(days: number): string {
	const abs = Math.abs(days)
	if (abs === 1) return '1 jour'
	if (abs < 60) return `${abs} jours`
	const months = Math.round(abs / 30.44)
	if (months < 24) return `${months} mois`
	const years = Math.floor(months / 12)
	const rest = months % 12
	return `${years} ans${rest ? ` et ${rest} mois` : ''}`
}

export function countdownText(days: number): string {
	if (days === 0) return 'C’est aujourd’hui.'
	if (days < 0) return `Dépassée depuis ${durationText(days)}.`
	return `Dans ${durationText(days)}.`
}

export function reminderFor(name: string, result: Extract<CtResult, { kind: 'echeance' }>, today: Date): CalendarEvent {
	const label = name || 'mon 2-roues'
	const late = result.status === 'retard'
	let day = addDays(result.deadline, -30)
	if (day <= today) day = addDays(today, 1)
	return {
		title: late ? `CT ${label} : échéance dépassée, prendre rendez-vous` : `CT ${label} : prendre rendez-vous (limite le ${formatShort(result.deadline)})`,
		day,
		details: `Date limite du contrôle technique : ${formatLong(result.deadline)}.\n${result.rule}\nCentre agréé catégorie L. La date du procès-verbal ou du timbre de la carte grise fait foi.\nhttps://trouve-ta-piece.fr/controle-technique`
	}
}

const compact = (date: Date) => toIsoDate(date).replaceAll('-', '')

export function googleCalendarUrl(event: CalendarEvent): string {
	const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title, dates: `${compact(event.day)}/${compact(addDays(event.day, 1))}`, details: event.details })
	return `https://calendar.google.com/calendar/render?${params.toString().replaceAll('+', '%20')}`
}

export function outlookCalendarUrl(event: CalendarEvent): string {
	const params = new URLSearchParams({
		path: '/calendar/action/compose',
		rru: 'addevent',
		subject: event.title,
		startdt: toIsoDate(event.day),
		enddt: toIsoDate(addDays(event.day, 1)),
		allday: 'true',
		body: event.details
	})
	return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString().replaceAll('+', '%20')}`
}

const icsText = (value: string) =>
	value
		.replaceAll('\\', '\\\\')
		.replaceAll('\n', '\\n')
		.replace(/([,;])/g, '\\$1')

const encoder = new TextEncoder()

function foldLine(line: string): string {
	const parts: Array<string> = []
	let chunk = ''
	let size = 0
	for (const char of line) {
		const bytes = encoder.encode(char).length
		if (size + bytes > (parts.length ? 74 : 75)) {
			parts.push(chunk)
			chunk = ''
			size = 0
		}
		chunk += char
		size += bytes
	}
	parts.push(chunk)
	return parts.join('\r\n ')
}

export function buildIcs(name: string, result: Extract<CtResult, { kind: 'echeance' }>, today: Date, now = new Date()): string {
	const label = name || 'mon 2-roues'
	const late = result.status === 'retard'
	const day = late ? addDays(today, 1) : result.deadline
	const summary = late ? `CT ${label} : échéance dépassée le ${formatShort(result.deadline)}` : `CT ${label} : date limite`
	const description = `Date limite du contrôle technique : ${formatLong(result.deadline)}.\n${result.rule}\nCentre agréé catégorie L. La date du procès-verbal ou du timbre de la carte grise fait foi.`
	const alarms = late ? ['PT9H'] : ['-P30D', '-P7D', 'PT9H']
	const stamp = now
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '')
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Trouve ta piece//Controle technique//FR',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:ct-${compact(result.deadline)}-${now.getTime()}@trouve-ta-piece.fr`,
		`DTSTAMP:${stamp}`,
		`DTSTART;VALUE=DATE:${compact(day)}`,
		`DTEND;VALUE=DATE:${compact(addDays(day, 1))}`,
		`SUMMARY:${icsText(summary)}`,
		`DESCRIPTION:${icsText(description)}`,
		'URL:https://trouve-ta-piece.fr/controle-technique',
		'TRANSP:TRANSPARENT',
		...alarms.flatMap((trigger) => ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(summary)}`, `TRIGGER:${trigger}`, 'END:VALARM']),
		'END:VEVENT',
		'END:VCALENDAR'
	]
	return `${lines.map(foldLine).join('\r\n')}\r\n`
}

export function amazonSearchUrl(query: string): string | undefined {
	if (!AMAZON_TAG) return undefined
	return `https://www.amazon.fr/s?${new URLSearchParams({ k: query, tag: AMAZON_TAG }).toString()}`
}
