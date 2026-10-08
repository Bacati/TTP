import { createTransport } from 'nodemailer'
import type { RenderedEmail } from './emails'

export interface Mailer {
	send(to: string, email: RenderedEmail): Promise<void>
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export interface SmtpOptions {
	host: string
	port: number
	secure: boolean
	requireTLS: boolean
	auth: { user: string; pass: string } | undefined
	pool: true
	maxConnections: number
	connectionTimeout: number
	greetingTimeout: number
	socketTimeout: number
	disableFileAccess: true
	disableUrlAccess: true
}

export function smtpOptions(smtpUrl: string): SmtpOptions {
	const url = new URL(smtpUrl)
	const secure = url.protocol === 'smtps:'
	if (!(secure || url.protocol === 'smtp:')) throw new Error('SMTP_URL doit commencer par smtp:// ou smtps://')
	return {
		host: url.hostname,
		port: url.port ? Number(url.port) : secure ? 465 : 587,
		secure,
		requireTLS: !(secure || LOCAL_HOSTS.has(url.hostname)),
		auth: url.username ? { user: decodeURIComponent(url.username), pass: decodeURIComponent(url.password) } : undefined,
		pool: true,
		maxConnections: 2,
		connectionTimeout: 10000,
		greetingTimeout: 10000,
		socketTimeout: 30000,
		disableFileAccess: true,
		disableUrlAccess: true
	}
}

export function createSmtpMailer(smtpUrl: string, from: string): Mailer {
	const transport = createTransport(smtpOptions(smtpUrl), { from })
	return {
		async send(to, email) {
			await transport.sendMail({ to, subject: email.subject, text: email.text, html: email.html, headers: email.headers })
		}
	}
}
