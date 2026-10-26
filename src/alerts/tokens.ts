import { createHmac, timingSafeEqual } from 'node:crypto'

export type TokenKind = 'confirm' | 'sub' | 'form'

const KINDS: ReadonlySet<string> = new Set(['confirm', 'sub', 'form'])
const TOKEN_PATTERN = /^([a-z]{1,10})\.(\d{1,15})\.(\d{1,12})\.([A-Za-z0-9_-]{43})$/

function signature(secret: string, payload: string): Buffer {
	return createHmac('sha256', secret).update(payload).digest()
}

export function signToken(secret: string, kind: TokenKind, subject: number, expiresAtMs: number): string {
	if (secret.length < 32) throw new Error('secret trop court')
	if (!Number.isSafeInteger(subject) || subject < 0) throw new Error('sujet invalide')
	const exp = expiresAtMs > 0 ? Math.ceil(expiresAtMs / 1000) : 0
	const payload = `${kind}.${subject}.${exp}`
	return `${payload}.${signature(secret, payload).toString('base64url')}`
}

export function verifyToken(secret: string, kind: TokenKind, token: unknown, nowMs: number): number | undefined {
	if (typeof token !== 'string' || token.length > 120 || secret.length < 32) return undefined
	const match = TOKEN_PATTERN.exec(token)
	if (!match) return undefined
	const [, tokenKind, subject, exp, sig] = match as unknown as [string, string, string, string, string]
	if (tokenKind !== kind || !KINDS.has(tokenKind)) return undefined
	const expected = signature(secret, `${tokenKind}.${subject}.${exp}`)
	const given = Buffer.from(sig, 'base64url')
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) return undefined
	const expSeconds = Number(exp)
	if (expSeconds !== 0 && expSeconds * 1000 <= nowMs) return undefined
	const value = Number(subject)
	return Number.isSafeInteger(value) ? value : undefined
}

export function safeEqual(a: string, b: string): boolean {
	const left = createHmac('sha256', 'compare').update(a).digest()
	const right = createHmac('sha256', 'compare').update(b).digest()
	return timingSafeEqual(left, right) && a.length === b.length
}
