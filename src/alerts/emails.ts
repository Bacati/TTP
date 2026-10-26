import { escapeHtml, formatDate, formatDateTime, formatPrice, headerSafe, isHttpsUrl } from './text'

export interface RenderedEmail {
	subject: string
	text: string
	html: string
	headers: Record<string, string>
}

export interface Sender {
	postalAddress: string
}

export interface DigestItem {
	title: string
	priceCents: number | null
	currency: string
	url: string
	imageUrl: string | null
	condition: string | null
	source: string
	foundAt: number
}

export interface DigestGroup {
	query: string
	expiresAt: number | null
	items: Array<DigestItem>
}

const SOURCE_LABELS: Record<string, string> = { ebay: 'eBay' }

const sourceLabel = (source: string) => SOURCE_LABELS[source] ?? source

function layout(title: string, body: string, footer: string): string {
	return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#ea580c;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:24px">${body}</td></tr>
<tr><td style="padding:16px 24px 24px;font-size:12px;line-height:1.5;color:#6b7280;border-top:1px solid #f3f4f6">${footer}</td></tr>
</table></td></tr></table></body></html>`
}

const button = (url: string, label: string) =>
	`<a href="${escapeHtml(url)}" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px">${escapeHtml(label)}</a>`

function criteria(query: string, reference: string | undefined, maxPriceCents: number | undefined): Array<string> {
	return [`Pièce : ${query}`, ...(reference ? [`Référence : ${reference}`] : []), ...(maxPriceCents !== undefined ? [`Prix maximum : ${formatPrice(maxPriceCents)}`] : [])]
}

const IGNORE_NOTICE = 'Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : aucune alerte ne sera créée et votre adresse sera effacée sous 48 heures.'

export function confirmationEmail(params: {
	query: string
	reference: string | undefined
	maxPriceCents: number | undefined
	confirmUrl: string
	expiresAt: number
	sender: Sender
}): RenderedEmail {
	const lines = criteria(params.query, params.reference, params.maxPriceCents)
	const subject = headerSafe(`Confirmez votre alerte « ${params.query} »`)
	const text = [
		'Bonjour,',
		'',
		'Vous avez demandé à être prévenu quand cette pièce est mise en vente :',
		...lines.map((line) => `- ${line}`),
		'',
		`Pour activer l’alerte, ouvrez ce lien avant le ${formatDateTime(params.expiresAt)} :`,
		params.confirmUrl,
		'',
		IGNORE_NOTICE,
		'',
		params.sender.postalAddress
	].join('\n')
	const html = layout(
		subject,
		`<h1 style="font-size:22px;margin:0 0 12px">Confirmez votre alerte</h1>
<p style="margin:0 0 12px">Vous avez demandé à être prévenu quand cette pièce est mise en vente :</p>
<ul style="margin:0 0 20px;padding-left:20px">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
<p style="margin:0 0 20px">${button(params.confirmUrl, 'Activer mon alerte')}</p>
<p style="margin:0;font-size:13px;color:#6b7280">Lien valable jusqu’au ${escapeHtml(formatDateTime(params.expiresAt))}.</p>`,
		`${escapeHtml(IGNORE_NOTICE)}<br>${escapeHtml(params.sender.postalAddress)}`
	)
	return { subject, text, html, headers: {} }
}

function unsubscribeHeaders(unsubscribeUrl: string): Record<string, string> {
	return { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
}

const AFFILIATE_NOTICE = 'Publicité : les liens sont des liens affiliés. Trouve ta pièce touche une commission si vous achetez, sans surcoût pour vous.'
const EBAY_NOTICE = 'En tant que partenaire eBay, Trouve ta pièce touche une commission sur les achats éligibles.'

interface FooterParams {
	manageUrl: string
	unsubscribeUrl: string
	sender: Sender
	notices: Array<string>
}

function footerHtml({ manageUrl, unsubscribeUrl, sender, notices }: FooterParams): string {
	return `Vous recevez cet e-mail parce que vous avez créé une alerte sur Trouve ta pièce.
${notices.map((notice) => `${escapeHtml(notice)}<br>`).join('\n')}
<a href="${escapeHtml(manageUrl)}" style="color:#ea580c">Gérer mes alertes</a> · <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7280">Me désinscrire</a><br>
${escapeHtml(sender.postalAddress)}`
}

function footerText({ manageUrl, unsubscribeUrl, sender, notices }: FooterParams): string {
	return [
		'Vous recevez cet e-mail parce que vous avez créé une alerte sur Trouve ta pièce.',
		...notices,
		`Gérer mes alertes : ${manageUrl}`,
		`Me désinscrire : ${unsubscribeUrl}`,
		sender.postalAddress
	].join('\n')
}

export function digestEmail(params: { groups: Array<DigestGroup>; extraCount: number; manageUrl: string; unsubscribeUrl: string; now: number; sender: Sender }): RenderedEmail {
	const groups = params.groups.map((group) => ({ ...group, items: group.items.filter((item) => isHttpsUrl(item.url)) })).filter((group) => group.items.length > 0)
	const hasEbay = groups.some((group) => group.items.some((item) => item.source === 'ebay'))
	const footer: FooterParams = { manageUrl: params.manageUrl, unsubscribeUrl: params.unsubscribeUrl, sender: params.sender, notices: [AFFILIATE_NOTICE, ...(hasEbay ? [EBAY_NOTICE] : [])] }
	const total = groups.reduce((sum, group) => sum + group.items.length, 0)
	const first = groups[0]
	const subject = headerSafe(groups.length === 1 && first ? `${total > 1 ? `${total} annonces` : 'Nouvelle annonce'} pour « ${first.query} »` : `${total} nouvelles annonces pour vos alertes`)
	const checkedAt = formatDateTime(params.now)
	const text = [
		'Bonjour,',
		'',
		'Publicité : sélection automatique d’annonces, liens affiliés.',
		'',
		...groups.flatMap((group) => [
			`Alerte « ${group.query} » :`,
			...group.items.map((item) => `- ${item.title} — ${formatPrice(item.priceCents, item.currency)}${item.condition ? ` (${item.condition})` : ''} — ${sourceLabel(item.source)}\n  ${item.url}`),
			''
		]),
		...(params.extraCount > 0 ? [`Et ${params.extraCount} autre(s) annonce(s) dans le prochain e-mail.`, ''] : []),
		`Prix relevés le ${checkedAt}. Ils peuvent avoir changé depuis : vérifiez l’annonce avant d’acheter.`,
		'',
		footerText(footer)
	].join('\n')
	const itemHtml = (item: DigestItem) => `<tr>
<td width="88" valign="top" style="padding:12px 12px 12px 0">${
		item.imageUrl && isHttpsUrl(item.imageUrl)
			? `<img src="${escapeHtml(item.imageUrl)}" width="80" alt="" style="display:block;width:80px;border-radius:8px">`
			: '<div style="width:80px;height:80px;border-radius:8px;background:#fff7ed"></div>'
	}</td>
<td valign="top" style="padding:12px 0">
<a href="${escapeHtml(item.url)}" style="color:#111827;font-weight:bold;text-decoration:none">${escapeHtml(item.title)}</a>
<div style="margin-top:4px;font-size:18px;font-weight:bold;color:#ea580c">${escapeHtml(formatPrice(item.priceCents, item.currency))}</div>
<div style="font-size:12px;color:#6b7280">${escapeHtml([item.condition, sourceLabel(item.source)].filter(Boolean).join(' · '))}</div>
<div style="margin-top:8px"><a href="${escapeHtml(item.url)}" style="color:#ea580c;font-weight:bold">Voir l’annonce</a></div>
</td></tr>`
	const body = groups
		.map(
			(group) => `<h2 style="font-size:18px;margin:0 0 4px">Alerte « ${escapeHtml(group.query)} »</h2>
${group.expiresAt ? `<p style="margin:0 0 8px;font-size:12px;color:#6b7280">Active jusqu’au ${escapeHtml(formatDate(group.expiresAt))}</p>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">${group.items.map(itemHtml).join('')}</table>`
		)
		.join('')
	const html = layout(
		subject,
		`<p style="margin:0 0 12px;font-size:12px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#6b7280">Publicité · liens affiliés</p>
${body}${params.extraCount > 0 ? `<p style="margin:0 0 12px">Et ${params.extraCount} autre(s) annonce(s) dans le prochain e-mail.</p>` : ''}
<p style="margin:0;font-size:12px;color:#6b7280">Prix relevés le ${escapeHtml(checkedAt)}. Ils peuvent avoir changé depuis : vérifiez l’annonce avant d’acheter.</p>`,
		footerHtml(footer)
	)
	return { subject, text, html, headers: unsubscribeHeaders(params.unsubscribeUrl) }
}

export function expiryEmail(params: { query: string; expiresAt: number; manageUrl: string; unsubscribeUrl: string; sender: Sender }): RenderedEmail {
	const footer: FooterParams = { manageUrl: params.manageUrl, unsubscribeUrl: params.unsubscribeUrl, sender: params.sender, notices: [] }
	const subject = headerSafe(`Votre alerte « ${params.query} » expire bientôt`)
	const date = formatDate(params.expiresAt)
	const text = [
		'Bonjour,',
		'',
		`Votre alerte « ${params.query} » s’arrêtera le ${date}.`,
		`Pour la garder 6 mois de plus, ouvrez la page de gestion : ${params.manageUrl}`,
		'Sans action de votre part, elle sera supprimée avec les données associées.',
		'',
		footerText(footer)
	].join('\n')
	const html = layout(
		subject,
		`<h1 style="font-size:22px;margin:0 0 12px">Votre alerte expire bientôt</h1>
<p style="margin:0 0 12px">Votre alerte « ${escapeHtml(params.query)} » s’arrêtera le ${escapeHtml(date)}. Sans action de votre part, elle sera supprimée avec les données associées.</p>
<p style="margin:0 0 8px">${button(params.manageUrl, 'Garder mon alerte 6 mois de plus')}</p>`,
		footerHtml(footer)
	)
	return { subject, text, html, headers: unsubscribeHeaders(params.unsubscribeUrl) }
}
