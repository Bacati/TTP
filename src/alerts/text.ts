const STOPWORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'en', 'au', 'aux', 'pour', 'avec', 'sur', 'par', 'a'])

function isInvisible(code: number): boolean {
	return code <= 0x1f || (code >= 0x7f && code <= 0x9f) || (code >= 0x200b && code <= 0x200f) || (code >= 0x202a && code <= 0x202e) || (code >= 0x2060 && code <= 0x2064) || code === 0xfeff
}

export function stripControl(value: string): string {
	let out = ''
	for (const char of value) out += isInvisible(char.codePointAt(0) ?? 0) ? ' ' : char
	return out.replace(/\s+/g, ' ').trim()
}

const LIGATURES = new Map([
	['œ', 'oe'],
	['æ', 'ae'],
	['ß', 'ss'],
	['ø', 'o'],
	['ł', 'l'],
	['đ', 'd'],
	['þ', 'th'],
	['ı', 'i']
])

export function normalizeText(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[œæßøłđþı]/g, (char) => LIGATURES.get(char) ?? char)
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
}

export function compactReference(value: string): string {
	return normalizeText(value).replace(/ /g, '')
}

export function keywords(value: string): Array<string> {
	return [...new Set(normalizeText(value).split(' '))].filter((word) => word.length >= 2 && !STOPWORDS.has(word))
}

export interface PreparedTitle {
	words: Array<string>
	compact: string
}

export function prepareTitle(title: string): PreparedTitle {
	const normalized = normalizeText(title)
	return { words: normalized.split(' '), compact: normalized.replaceAll(' ', '') }
}

export function compileMatcher(query: string, reference: string | undefined): (title: PreparedTitle) => boolean {
	if (reference) {
		const ref = compactReference(reference)
		return (title) => ref.length >= 3 && title.compact.includes(ref)
	}
	const wanted = keywords(query)
	if (wanted.length === 0) return () => false
	return (title) => wanted.every((word) => title.words.some((candidate) => candidate === word || (word.length >= 4 && candidate.startsWith(word))))
}

export function titleMatches(title: string, query: string, reference: string | undefined): boolean {
	return compileMatcher(query, reference)(prepareTitle(title))
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

export function headerSafe(value: string, max = 150): string {
	const clean = stripControl(value)
	return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean
}

export function parsePriceCents(value: string): number | undefined {
	const cleaned = value.replace(/[\s  ]/g, '').replace(/(eur|€)$/i, '')
	if (!/^\d{1,7}([.,]\d{1,2})?$/.test(cleaned)) return undefined
	const cents = Math.round(Number(cleaned.replace(',', '.')) * 100)
	return Number.isSafeInteger(cents) ? cents : undefined
}

export function formatPrice(cents: number | undefined | null, currency = 'EUR'): string {
	if (cents === undefined || cents === null) return 'Prix non communiqué'
	try {
		return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100)
	} catch {
		return `${(cents / 100).toFixed(2)} ${currency}`
	}
}

const PARIS_DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
const PARIS_DATE_TIME = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })

export const formatDate = (ms: number) => PARIS_DATE.format(new Date(ms))
export const formatDateTime = (ms: number) => PARIS_DATE_TIME.format(new Date(ms))

export function maskEmail(email: string): string {
	const [local = '', domain = ''] = email.split('@')
	return `${local.slice(0, 2)}***@${domain}`
}

export function isHttpsUrl(value: unknown, hostPattern?: RegExp): value is string {
	if (typeof value !== 'string' || value.length > 2048) return false
	try {
		const url = new URL(value)
		if (url.protocol !== 'https:' || url.username || url.password) return false
		return hostPattern ? hostPattern.test(url.hostname) : true
	} catch {
		return false
	}
}
