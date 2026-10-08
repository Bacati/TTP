import { keywords, parsePriceCents, stripControl } from './text'

export interface AlertInput {
	email: string
	query: string
	reference: string | undefined
	maxPriceCents: number | undefined
}

export type AlertField = 'email' | 'query' | 'reference' | 'maxPrice' | 'consent'

export type FormValues = Record<'email' | 'query' | 'reference' | 'maxPrice', string>

export type ParseResult = { ok: true; value: AlertInput; values: FormValues } | { ok: false; errors: Partial<Record<AlertField, string>>; values: FormValues }

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/

export function normalizeEmail(value: string): string | undefined {
	const email = value.trim().toLowerCase()
	if (email.length > 254 || !EMAIL_PATTERN.test(email)) return undefined
	const [local = '', domain = ''] = email.split('@')
	if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return undefined
	if (!(/\.[a-z]{2,63}$/.test(domain) || /\.xn--[a-z0-9-]{2,59}$/.test(domain))) return undefined
	return email
}

const field = (form: FormData, name: string, max: number) => {
	const value = form.get(name)
	return typeof value === 'string' ? value.slice(0, max) : ''
}

export function parseAlertForm(form: FormData): ParseResult {
	const values: FormValues = {
		email: field(form, 'email', 300).trim(),
		query: stripControl(field(form, 'query', 200)),
		reference: stripControl(field(form, 'reference', 100)),
		maxPrice: field(form, 'maxPrice', 30).trim()
	}
	const errors: Partial<Record<AlertField, string>> = {}

	const email = normalizeEmail(values.email)
	if (!email) errors.email = 'Saisissez une adresse e-mail valide.'

	if (values.query.length < 3 || values.query.length > 80) errors.query = 'Décrivez la pièce en 3 à 80 caractères.'
	else if (keywords(values.query).length === 0) errors.query = 'Ajoutez au moins un mot significatif, par exemple le modèle ou la pièce.'

	let reference: string | undefined
	if (values.reference) {
		if (!/^[A-Za-z0-9 ./-]{3,40}$/.test(values.reference) || values.reference.replace(/[^A-Za-z0-9]/g, '').length < 3) {
			errors.reference = 'La référence ne doit contenir que des lettres, chiffres, espaces, points, tirets ou barres obliques.'
		} else {
			reference = values.reference
		}
	}

	let maxPriceCents: number | undefined
	if (values.maxPrice) {
		const cents = parsePriceCents(values.maxPrice)
		if (cents === undefined || cents < 100 || cents > 10000000) errors.maxPrice = 'Indiquez un prix entre 1 et 100 000 €, ou laissez vide.'
		else maxPriceCents = cents
	}

	if (form.get('consent') !== 'oui') errors.consent = 'Cochez la case pour recevoir les alertes.'

	if (!email || Object.keys(errors).length > 0) return { ok: false, errors, values }
	return { ok: true, value: { email, query: values.query, reference, maxPriceCents }, values }
}
