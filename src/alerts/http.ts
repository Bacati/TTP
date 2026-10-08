import { isIP } from 'node:net'

export class RateLimiter {
	private readonly hits = new Map<string, Array<number>>()
	private readonly windowMs: number
	private readonly max: number
	private readonly maxKeys: number

	constructor(windowMs: number, max: number, maxKeys = 10000) {
		this.windowMs = windowMs
		this.max = max
		this.maxKeys = maxKeys
	}

	allow(key: string, now: number): boolean {
		const since = now - this.windowMs
		const recent = (this.hits.get(key) ?? []).filter((time) => time > since)
		if (recent.length >= this.max) {
			this.hits.set(key, recent)
			return false
		}
		recent.push(now)
		this.hits.delete(key)
		this.hits.set(key, recent)
		if (this.hits.size > this.maxKeys) {
			const oldest = this.hits.keys().next().value
			if (oldest !== undefined) this.hits.delete(oldest)
		}
		return true
	}
}

function originOf(value: string | null): string | undefined {
	if (!value) return undefined
	try {
		return new URL(value).origin
	} catch {
		return undefined
	}
}

export function isSameOrigin(request: Request, siteUrl: string): boolean {
	const allowed = new Set([new URL(siteUrl).origin, new URL(request.url).origin])
	const origin = request.headers.get('origin')
	if (origin !== null) return origin !== 'null' && allowed.has(origin)
	const referer = originOf(request.headers.get('referer'))
	return referer !== undefined && allowed.has(referer)
}

export function clientIp(request: Request, clientAddress: string | undefined, trustProxy: boolean): string {
	if (trustProxy) {
		const forwarded = (request.headers.get('x-forwarded-for') ?? '')
			.split(',')
			.map((part) => part.trim())
			.filter(Boolean)
		const last = forwarded.at(-1)
		if (last && isIP(last)) return last
		const real = request.headers.get('x-real-ip')?.trim()
		if (real && isIP(real)) return real
	}
	return clientAddress && isIP(clientAddress) ? clientAddress : 'inconnu'
}
