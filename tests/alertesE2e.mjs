import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { createServer as createTcpServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SECRET = 'secret-e2e-0123456789-abcdefghijklmnopqrstuv'
const RUN_TOKEN = 'jeton-e2e-0123456789-abcdefghijklmnopqrstuv'
const CLIENT = { id: 'client-e2e', secret: 'secret-client-e2e', campaign: '5338999999' }
const EMAIL = 'lucas.e2e@example.fr'
const HONEYPOT = 'site_web'
const POSTAL = 'Trouve ta pièce, 26 boulevard Robert Schuman, 44300 Nantes'

const results = []
function check(label, condition, detail = '') {
	results.push({ label, ok: Boolean(condition) })
	console.log(`${condition ? 'OK  ' : 'ÉCHEC'} ${label}${condition || !detail ? '' : ` : ${detail}`}`)
}

function listen(server) {
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)))
}

function startEbay() {
	const state = { tokenCalls: 0, searchCalls: 0, items: [], lastSearch: undefined }
	const server = createServer((req, res) => {
		let body = ''
		req.on('data', (chunk) => {
			body += chunk
		})
		req.on('end', () => {
			const url = new URL(req.url, 'http://127.0.0.1')
			if (req.method === 'POST' && url.pathname === '/identity/v1/oauth2/token') {
				state.tokenCalls++
				const expected = `Basic ${Buffer.from(`${CLIENT.id}:${CLIENT.secret}`).toString('base64')}`
				const params = new URLSearchParams(body)
				if (req.headers.authorization !== expected || params.get('grant_type') !== 'client_credentials') {
					res.writeHead(401).end('{}')
					return
				}
				res.writeHead(200, { 'content-type': 'application/json' }).end('{"access_token":"jeton-application-e2e","expires_in":7200}')
				return
			}
			if (req.method === 'GET' && url.pathname === '/buy/browse/v1/item_summary/search') {
				state.searchCalls++
				state.lastSearch = { url, headers: req.headers }
				if (req.headers.authorization !== 'Bearer jeton-application-e2e') {
					res.writeHead(401).end('{}')
					return
				}
				res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ total: state.items.length, itemSummaries: state.items }))
				return
			}
			res.writeHead(404).end()
		})
	})
	return { server, state }
}

function smtpReply(command, line, current) {
	if (command.startsWith('EHLO')) return '250-sink.local\r\n250-8BITMIME\r\n250 SMTPUTF8\r\n'
	if (command.startsWith('HELO')) return '250 sink.local\r\n'
	if (command.startsWith('MAIL FROM')) {
		current.from = line.slice(10)
		return '250 2.1.0 Ok\r\n'
	}
	if (command.startsWith('RCPT TO')) {
		current.to.push(line.slice(8).replace(/[<>]/g, ''))
		return '250 2.1.5 Ok\r\n'
	}
	if (command === 'DATA') return '354 End data with <CR><LF>.<CR><LF>\r\n'
	if (command === 'RSET' || command === 'NOOP') return '250 Ok\r\n'
	return '502 5.5.2 Error: command not recognized\r\n'
}

function readMessage(session, messages, socket) {
	const end = session.buffer.indexOf('\r\n.\r\n')
	if (end === -1) return false
	session.current.raw = session.buffer.slice(0, end)
	session.buffer = session.buffer.slice(end + 5)
	messages.push(session.current)
	session.current = { from: '', to: [], raw: '' }
	session.data = false
	socket.write('250 2.0.0 Ok: queued\r\n')
	return true
}

function readCommand(session, socket) {
	const index = session.buffer.indexOf('\r\n')
	if (index === -1) return false
	const line = session.buffer.slice(0, index)
	session.buffer = session.buffer.slice(index + 2)
	const command = line.toUpperCase()
	if (command === 'QUIT') {
		socket.end('221 2.0.0 Bye\r\n')
		return false
	}
	if (command === 'DATA') session.data = true
	socket.write(smtpReply(command, line, session.current))
	return true
}

function startSmtp() {
	const messages = []
	const server = createTcpServer((socket) => {
		const session = { buffer: '', data: false, current: { from: '', to: [], raw: '' } }
		socket.write('220 sink.local ESMTP\r\n')
		socket.on('data', (chunk) => {
			session.buffer += chunk.toString('utf8')
			let more = true
			while (more) more = session.data ? readMessage(session, messages, socket) : readCommand(session, socket)
		})
	})
	return { server, messages }
}

function decodeQuotedPrintable(text) {
	const bytes = []
	const soft = text.replace(/=\r?\n/g, '')
	for (let i = 0; i < soft.length; i++) {
		if (soft[i] === '=' && /^[0-9A-F]{2}$/i.test(soft.slice(i + 1, i + 3))) {
			bytes.push(Number.parseInt(soft.slice(i + 1, i + 3), 16))
			i += 2
		} else {
			bytes.push(...Buffer.from(soft[i], 'utf8'))
		}
	}
	return Buffer.from(bytes).toString('utf8')
}

function textPart(raw) {
	const match = /Content-Type: text\/plain[^\r\n]*\r\nContent-Transfer-Encoding: ([^\r\n]+)\r\n\r\n([\s\S]*?)\r\n(?:----|--_)/i.exec(raw)
	if (!match) return ''
	const [, encoding, body] = match
	if (/quoted-printable/i.test(encoding)) return decodeQuotedPrintable(body)
	if (/base64/i.test(encoding)) return Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf8')
	return body
}

function htmlPart(raw) {
	const match = /Content-Type: text\/html[^\r\n]*\r\nContent-Transfer-Encoding: ([^\r\n]+)\r\n\r\n([\s\S]*?)\r\n(?:----|--_)/i.exec(raw)
	if (!match) return ''
	const [, encoding, body] = match
	if (/quoted-printable/i.test(encoding)) return decodeQuotedPrintable(body)
	if (/base64/i.test(encoding)) return Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf8')
	return body
}

function header(raw, name) {
	const head = raw.split('\r\n\r\n')[0].replace(/\r\n[ \t]+/g, ' ')
	const line = head.split('\r\n').find((l) => l.toLowerCase().startsWith(`${name.toLowerCase()}:`))
	return line ? line.slice(name.length + 1).trim() : undefined
}

async function waitFor(predicate, label, timeout = 15000) {
	const start = Date.now()
	while (Date.now() - start < timeout) {
		if (await predicate()) return true
		await new Promise((resolve) => setTimeout(resolve, 100))
	}
	throw new Error(`délai dépassé : ${label}`)
}

function startSite(port, env) {
	const output = []
	const child = spawn(process.execPath, ['dist/server/entry.mjs'], {
		env: {
			...Object.fromEntries([
				['PATH', process.env.PATH],
				['HOST', '127.0.0.1'],
				['PORT', String(port)]
			]),
			...env
		},
		stdio: ['ignore', 'pipe', 'pipe']
	})
	child.stdout.on('data', (chunk) => output.push(chunk.toString()))
	child.stderr.on('data', (chunk) => output.push(chunk.toString()))
	return { child, output }
}

async function freePort() {
	const server = createTcpServer()
	const port = await listen(server)
	await new Promise((resolve) => server.close(resolve))
	return port
}

const field = (html, name) => new RegExp(`name="${name}" value="([^"]*)"`).exec(html)?.[1]

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const runWith = (t, token) => fetch(t.runUrl, { method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {} })

async function stepForm(t) {
	const page = await fetch(`${t.site}/alertes`)
	const html = await page.text()
	check('la page /alertes répond en 200', page.status === 200)
	check('la politique de sécurité CSP est appliquée', (page.headers.get('content-security-policy') ?? '').includes("script-src 'self'"))
	check('la page n’est pas mise en cache', page.headers.get('cache-control') === 'no-store')
	const jeton = field(html, 'jeton')
	check('le formulaire porte un jeton anti-robot', /^form\.\d+\.\d+\./.test(jeton ?? ''))
	const inlineScripts = [...html.matchAll(/<script([^>]*)>/g)].filter((m) => !(/\bsrc=/.test(m[1]) || m[1].includes('application/ld+json')))
	check('aucun script en ligne exécutable', inlineScripts.length === 0, String(inlineScripts.length))
	t.body = { email: EMAIL, query: 'Carter Derbi <b>Euro 3</b>', reference: '', maxPrice: '150', consent: 'oui', [HONEYPOT]: '', jeton }
}

async function stepCreate(t) {
	const noOrigin = await t.form({ path: '/alertes', body: t.body }, {})
	check('envoi sans en-tête Origin refusé (403)', noOrigin.status === 403)
	const tooFast = await t.form({ path: '/alertes', body: t.body })
	check('envoi trop rapide : réponse neutre', tooFast.status === 200 && (await tooFast.text()).includes('Vérifiez votre boîte mail'))
	check('envoi trop rapide : aucun e-mail', t.smtp.messages.length === 0)
	await pause(2200)
	const created = await t.form({ path: '/alertes', body: t.body })
	check('création acceptée', created.status === 200 && (await created.text()).includes('Vérifiez votre boîte mail'))
	await waitFor(() => t.smtp.messages.length === 1, 'e-mail de confirmation')
	const confirmation = t.smtp.messages[0]
	check('e-mail de confirmation adressé au bon destinataire', confirmation.to.includes(EMAIL))
	const confirmText = textPart(confirmation.raw)
	t.confirmLink = new RegExp(`${t.site.replace(/[.]/g, '\\.')}/alertes/confirmer\\?t=[A-Za-z0-9._-]+`).exec(confirmText)?.[0]
	check('le lien de confirmation est présent', Boolean(t.confirmLink), confirmText.slice(0, 300))
	check('l’objet de l’e-mail ne contient pas de retour à la ligne injecté', !/[\r\n]/.test(header(confirmation.raw, 'Subject') ?? ''))
	check('adresse postale dans l’e-mail de confirmation', confirmText.includes(POSTAL))
}

async function stepConfirm(t) {
	const ask = await fetch(t.confirmLink)
	const askHtml = await ask.text()
	check('la page de confirmation demande un clic', ask.status === 200 && askHtml.includes('Activer cette alerte'))
	check('le texte saisi est échappé à l’affichage', askHtml.includes('&lt;b&gt;Euro 3&lt;/b&gt;') && !askHtml.includes('<b>Euro 3</b>'))
	check('pas de statistiques sur une page à jeton', !askHtml.includes('/js/script.js'))
	check('page à jeton exclue des moteurs de recherche', askHtml.includes('noindex'))
	const token = new URL(t.confirmLink).searchParams.get('t')
	const crossSite = await t.form({ path: '/alertes/confirmer', body: { t: token } }, { origin: 'https://evil.example' })
	check('confirmation depuis un autre site refusée', crossSite.status === 403)
	const forged = await t.form({ path: '/alertes/confirmer', body: { t: `${token.slice(0, -2)}AA` } })
	check('jeton de confirmation falsifié refusé', forged.status === 400)
	const confirmed = await t.form({ path: '/alertes/confirmer', body: { t: token } })
	check('alerte activée après le clic', confirmed.status === 200 && (await confirmed.text()).includes('Alerte activée'))
}

const EBAY_ITEMS = [
	{
		itemId: 'v1|111|0',
		title: 'Carter Derbi Euro 3 origine',
		price: { value: '89.00', currency: 'EUR' },
		image: { imageUrl: 'https://i.ebayimg.com/images/g/111/s-l225.jpg' },
		itemWebUrl: 'https://www.ebay.fr/itm/111',
		itemAffiliateWebUrl: `https://www.ebay.fr/itm/111?mkcid=1&campid=${CLIENT.campaign}&customid=alertes`,
		condition: 'Occasion'
	},
	{
		itemId: 'v1|222|0',
		title: '<script>alert(1)</script> Carter Derbi Euro 3',
		price: { value: '35.00', currency: 'EUR' },
		itemAffiliateWebUrl: `https://www.ebay.fr/itm/222?campid=${CLIENT.campaign}`
	},
	{ itemId: 'v1|333|0', title: 'Carter Derbi Euro 3 piégé', price: { value: '10.00', currency: 'EUR' }, itemAffiliateWebUrl: 'https://ebay.fr.evil.example/itm/333' },
	{ itemId: 'v1|444|0', title: 'Carter Derbi Euro 3 trop cher', price: { value: '900.00', currency: 'EUR' }, itemAffiliateWebUrl: `https://www.ebay.fr/itm/444?campid=${CLIENT.campaign}` },
	{ itemId: 'v1|666|0', title: 'Phare Yamaha DT 50 hors sujet', price: { value: '20.00', currency: 'EUR' }, itemAffiliateWebUrl: `https://www.ebay.fr/itm/666?campid=${CLIENT.campaign}` }
]

async function stepRun(t) {
	check('déclenchement sans jeton refusé (401)', (await runWith(t)).status === 401)
	check('déclenchement avec un mauvais jeton refusé (401)', (await runWith(t, `${RUN_TOKEN}x`)).status === 401)
	check('déclenchement en GET refusé (405)', (await fetch(t.runUrl)).status === 405)
	t.ebay.state.items = [...EBAY_ITEMS]
	const run = await runWith(t, RUN_TOKEN)
	const summary = await run.json()
	check('premier passage : 1 alerte vérifiée, 2 annonces, 1 e-mail', run.status === 200 && summary.checked === 1 && summary.newMatches === 2 && summary.emailsSent === 1, JSON.stringify(summary))
	const search = t.ebay.state.lastSearch
	check('eBay interrogé sur le marché français', search?.headers['x-ebay-c-marketplace-id'] === 'EBAY_FR')
	check('identifiant d’affiliation transmis à eBay', search?.headers['x-ebay-c-enduserctx'] === `affiliateCampaignId=${CLIENT.campaign},affiliateReferenceId=alertes`)
	check('filtres prix et livraison transmis', search?.url.searchParams.get('filter') === 'deliveryCountry:FR,price:[..150.00],priceCurrency:EUR', search?.url.searchParams.get('filter'))
	await waitFor(() => t.smtp.messages.length === 2, 'e-mail d’annonces')
	t.digest = t.smtp.messages[1]
}

function stepDigest(t) {
	const digestText = textPart(t.digest.raw)
	const digestHtml = htmlPart(t.digest.raw)
	check('lien affilié eBay dans l’e-mail', digestText.includes(`https://www.ebay.fr/itm/111?mkcid=1&campid=${CLIENT.campaign}&customid=alertes`))
	check('lien piégé écarté', !(digestText.includes('evil.example') || digestHtml.includes('evil.example')))
	check('titre hostile échappé dans le HTML', digestHtml.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && !digestHtml.includes('<script>alert(1)'))
	t.listUnsubscribe = header(t.digest.raw, 'List-Unsubscribe') ?? ''
	check('en-tête List-Unsubscribe présent', /^<http:\/\/127\.0\.0\.1:\d+\/api\/alertes\/desinscription\?t=sub\./.test(t.listUnsubscribe), t.listUnsubscribe)
	check('désinscription en un clic déclarée (RFC 8058)', header(t.digest.raw, 'List-Unsubscribe-Post') === 'List-Unsubscribe=One-Click')
	check('mention des liens affiliés', digestText.includes('liens affiliés'))
	check('fraîcheur des prix indiquée', digestText.includes('Prix relevés le'))
	check('annonce hors sujet écartée', !digestText.includes('Yamaha'))
	check('publicité signalée et divulgation eBay', digestText.includes('Publicité') && digestText.includes('En tant que partenaire eBay'))
	check('adresse postale de l’expéditeur en pied de mail', digestText.includes(POSTAL) && digestHtml.includes('26 boulevard Robert Schuman'))
}

async function stepRepeat(t) {
	const again = await (await runWith(t, RUN_TOKEN)).json()
	check('second passage immédiat : rien de revérifié ni renvoyé', again.checked === 0 && again.emailsSent === 0, JSON.stringify(again))
	check('un seul jeton OAuth demandé pour tout le test', t.ebay.state.tokenCalls === 1)
	const freshToken = field(await (await fetch(`${t.site}/alertes`)).text(), 'jeton')
	await pause(2200)
	const duplicate = await t.form({ path: '/alertes', body: { ...t.body, query: 'carter  DERBI <b>euro 3</b>', jeton: freshToken } })
	const duplicateHtml = await duplicate.text()
	await pause(300)
	const neutral = duplicate.status === 200 && duplicateHtml.includes('Vérifiez votre boîte mail')
	check('même alerte déjà active : réponse neutre, aucun e-mail', neutral && t.smtp.messages.length === 2 && t.app.output.join('').includes('création refusée (duplicate)'))
}

async function stepUnsubscribe(t) {
	const unsubscribeUrl = t.listUnsubscribe.slice(1, -1)
	const manageGet = await fetch(unsubscribeUrl, { redirect: 'manual' })
	const location = manageGet.headers.get('location') ?? ''
	check('lien de désinscription en GET : renvoi vers la gestion', manageGet.status === 303 && location.startsWith('/alertes/gerer?t=sub.'))
	const manageHtml = await (await fetch(`${t.site}${location}`)).text()
	check('page de gestion : adresse masquée', manageHtml.includes('lu***@example.fr') && !manageHtml.includes(EMAIL))
	const subToken = new URL(`${t.site}${location}`).searchParams.get('t')
	const csrf = await t.form({ path: '/alertes/gerer', body: { t: subToken, action: 'tout-supprimer' } }, { origin: 'https://evil.example' })
	const stillThere = await (await fetch(`${t.site}${location}`)).text()
	check('CSRF : suppression depuis un autre site refusée', csrf.status === 403 && stillThere.includes('Mes alertes'))
	const oneClick = await fetch(unsubscribeUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' })
	check('désinscription en un clic (POST sans Origin)', oneClick.status === 200)
	check('après désinscription : plus rien n’est conservé', (await (await fetch(`${t.site}${location}`)).text()).includes('Aucune alerte'))
	t.ebay.state.items.push({
		itemId: 'v1|555|0',
		title: 'Carter Derbi Euro 3 tout neuf',
		price: { value: '50.00', currency: 'EUR' },
		itemAffiliateWebUrl: `https://www.ebay.fr/itm/555?campid=${CLIENT.campaign}`
	})
	const finalRun = await (await runWith(t, RUN_TOKEN)).json()
	check('plus aucun e-mail après désinscription', finalRun.emailsSent === 0 && t.smtp.messages.length === 2)
	check('lien de gestion falsifié refusé', (await fetch(`${t.site}/alertes/gerer?t=sub.1.0.${'A'.repeat(43)}`)).status === 400)
	const logs = t.app.output.join('')
	check('les journaux ne contiennent ni adresse e-mail ni jeton', !(logs.includes(EMAIL) || /[?&]t=(confirm|sub)\.\d/.test(logs)), logs.slice(-500))
}

async function scenarioComplet() {
	const ebay = startEbay()
	const smtp = startSmtp()
	const ebayPort = await listen(ebay.server)
	const smtpPort = await listen(smtp.server)
	const port = await freePort()
	const site = `http://127.0.0.1:${port}`
	const dir = mkdtempSync(join(tmpdir(), 'alertes-e2e-'))
	const env = Object.fromEntries([
		['ALERTS_ENABLED', 'true'],
		['ALERTS_SECRET', SECRET],
		['ALERTS_RUN_TOKEN', RUN_TOKEN],
		['ALERTS_DB_PATH', join(dir, 'alertes.sqlite')],
		['SITE_URL', site],
		['SMTP_URL', `smtp://127.0.0.1:${smtpPort}`],
		['MAIL_FROM', 'Trouve ta pièce <alertes@trouve-ta-piece.fr>'],
		['MAIL_POSTAL_ADDRESS', POSTAL],
		['EBAY_ENABLED', 'true'],
		['EBAY_CLIENT_ID', CLIENT.id],
		['EBAY_CLIENT_SECRET', CLIENT.secret],
		['EBAY_CAMPAIGN_ID', CLIENT.campaign],
		['EBAY_API_BASE', `http://127.0.0.1:${ebayPort}`]
	])
	const app = startSite(port, env)
	const form = (fields, headers = { origin: site }) =>
		fetch(`${site}${fields.path}`, {
			method: 'POST',
			redirect: 'manual',
			headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers },
			body: new URLSearchParams(fields.body).toString()
		})
	const t = { site, form, smtp, ebay, app, runUrl: `${site}/api/alertes/executer` }
	try {
		await waitFor(async () => (await fetch(`${site}/alertes`).catch(() => undefined))?.ok, 'démarrage du site')
		await stepForm(t)
		await stepCreate(t)
		await stepConfirm(t)
		await stepRun(t)
		stepDigest(t)
		await stepRepeat(t)
		await stepUnsubscribe(t)
	} finally {
		app.child.kill()
		ebay.server.close()
		smtp.server.close()
		rmSync(dir, { recursive: true, force: true })
	}
	return env
}

async function scenarioLimites(env) {
	const port = await freePort()
	const dir = mkdtempSync(join(tmpdir(), 'alertes-e2e-limite-'))
	const base = `http://127.0.0.1:${port}`
	const feeds = JSON.stringify([{ name: 'muc-off', url: 'https://f.exemple.com/a.csv', columns: { title: 'name', url: 'link' } }])
	const overrides = Object.fromEntries([
		['EBAY_ENABLED', 'false'],
		['FEEDS', feeds],
		['ALERTS_DB_PATH', join(dir, 'alertes.sqlite')],
		['SITE_URL', base]
	])
	const site = startSite(port, { ...env, ...overrides })
	const post = (body) => fetch(`${base}/alertes`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', origin: base }, body })
	try {
		await waitFor(async () => (await fetch(`${base}/alertes`).catch(() => undefined))?.ok, 'démarrage du second site')
		const huge = await post(`query=${'a'.repeat(50000)}`)
		check('corps de requête trop gros refusé (400)', huge.status === 400, String(huge.status))
		const statuses = []
		for (let i = 0; i < 11; i++) statuses.push((await post(new URLSearchParams({ email: `robot${i}@example.fr`, query: 'Carter', consent: 'oui', jeton: 'x' }).toString())).status)
		check('limite de débit par adresse IP sur le formulaire (429)', statuses.slice(0, 9).every((s) => s === 400) && statuses.slice(9).every((s) => s === 429), statuses.join(','))
	} finally {
		site.child.kill()
		rmSync(dir, { recursive: true, force: true })
	}
}

async function scenarioDesactive() {
	const port = await freePort()
	const disabled = startSite(port, {})
	const base = `http://127.0.0.1:${port}`
	try {
		await waitFor(async () => (await fetch(`${base}/alertes`).catch(() => undefined))?.ok, 'démarrage sans configuration')
		check('sans configuration : la page annonce le service à venir', (await (await fetch(`${base}/alertes`)).text()).includes('Les alertes arrivent bientôt'))
		check('sans configuration : déclenchement indisponible (404)', (await fetch(`${base}/api/alertes/executer`, { method: 'POST' })).status === 404)
		check('sans configuration : le reste du site fonctionne', (await fetch(`${base}/controle-technique`)).status === 200)
	} finally {
		disabled.child.kill()
	}
}

async function main() {
	const env = await scenarioComplet()
	await scenarioLimites(env)
	await scenarioDesactive()
	const failed = results.filter((r) => !r.ok)
	console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies`)
	if (failed.length) process.exit(1)
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
