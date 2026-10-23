import { createHmac } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { safeEqual } from './tokens'

export const NEWSLETTER_FILE = 'data/newsletter.jsonl'
export const MAX_SUBSCRIBERS = 20000

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizeEmail(value: unknown): string | undefined {
	const email = String(value ?? '')
		.trim()
		.toLowerCase()
	return email.length <= 254 && EMAIL.test(email) ? email : undefined
}

/** Jeton de désinscription : seul le destinataire d'un e-mail de la newsletter en possède un. */
export function unsubscribeToken(secret: string, email: string): string {
	return createHmac('sha256', secret).update(`newsletter-unsubscribe:${email}`).digest('base64url')
}

export function isValidUnsubscribeToken(secret: string, email: string, token: unknown): boolean {
	return typeof token === 'string' && token.length < 100 && safeEqual(token, unsubscribeToken(secret, email))
}

interface Subscriber {
	email: string
	consent: boolean
	date: string
}

/** Fichier JSONL des abonnés : écritures sérialisées dans le processus, réécriture atomique. */
export class NewsletterStore {
	private queue: Promise<unknown> = Promise.resolve()

	constructor(private readonly file = NEWSLETTER_FILE) {}

	private serialized<T>(task: () => Promise<T>): Promise<T> {
		const run = this.queue.then(task, task)
		this.queue = run.catch(() => undefined)
		return run
	}

	private async read(): Promise<Array<Subscriber>> {
		const text = await readFile(this.file, 'utf8').catch(() => '')
		const rows: Array<Subscriber> = []
		for (const line of text.split('\n')) {
			if (!line) continue
			try {
				const row = JSON.parse(line) as Subscriber
				if (typeof row.email === 'string') rows.push(row)
			} catch {
				// ligne illisible : ignorée plutôt que de bloquer la liste
			}
		}
		return rows
	}

	private async write(rows: Array<Subscriber>): Promise<void> {
		await mkdir(dirname(this.file), { recursive: true })
		const temp = `${this.file}.tmp`
		await writeFile(temp, rows.map((row) => `${JSON.stringify(row)}\n`).join(''))
		await rename(temp, this.file)
	}

	/** 'full' quand la liste a atteint son plafond ; une adresse déjà inscrite n'est pas dupliquée. */
	subscribe(email: string, now: Date): Promise<'added' | 'exists' | 'full'> {
		return this.serialized(async () => {
			const rows = await this.read()
			if (rows.some((row) => row.email === email)) return 'exists'
			if (rows.length >= MAX_SUBSCRIBERS) return 'full'
			rows.push({ email, consent: true, date: now.toISOString() })
			await this.write(rows)
			return 'added'
		})
	}

	unsubscribe(email: string): Promise<boolean> {
		return this.serialized(async () => {
			const rows = await this.read()
			const kept = rows.filter((row) => row.email !== email)
			if (kept.length === rows.length) return false
			await this.write(kept)
			return true
		})
	}
}
