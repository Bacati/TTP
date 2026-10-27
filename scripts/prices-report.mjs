/**
 * Rapport de fraîcheur des prix produits : `npm run prices:report`.
 *
 * Liste les produits affiliés dont le prix est à revérifier à la main sur le site du marchand
 * (relevé absent ou plus ancien que PRICE_MAX_AGE_DAYS, seuil lu dans `src/libs/priceFreshness.ts`),
 * et signale les liens affiliés utilisés par plusieurs produits (un lien partagé = une des deux fiches
 * pointe vers la mauvaise page, donc affiche un mauvais prix).
 * Aucune requête réseau : les prix ne sont jamais lus automatiquement (interdit par Amazon Partenaires).
 * Code de sortie 1 s'il y a au moins un prix à revérifier ou un lien partagé.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const maxDays = Number(readFileSync(join(root, 'src/libs/priceFreshness.ts'), 'utf8').match(/PRICE_MAX_AGE_DAYS = (\d+)/)?.[1] ?? 60)
const now = new Date()
const dir = join(root, 'src/content/products')

const products = readdirSync(dir)
	.filter((f) => f.endsWith('.json'))
	.map((f) => ({ id: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(dir, f), 'utf8')) }))
	.filter((p) => p.link?.type === 'external' && (p.priceKey || p.price != null))

const ageOf = (p) => (p.priceCheckedAt ? Math.floor((now - new Date(p.priceCheckedAt)) / 86_400_000) : null)
const rows = products.map((p) => ({ id: p.id, checkedAt: p.priceCheckedAt ?? '-', age: ageOf(p), url: p.link.url }))
const stale = rows.filter((r) => r.age === null || r.age < -1 || r.age > maxDays).sort((a, b) => (b.age ?? Infinity) - (a.age ?? Infinity))

const byUrl = new Map()
for (const r of rows) byUrl.set(r.url, [...(byUrl.get(r.url) ?? []), r.id])
const shared = [...byUrl.entries()].filter(([, ids]) => ids.length > 1)

console.log(`${rows.length} produits avec prix ; seuil : ${maxDays} jours ; date du jour : ${now.toISOString().slice(0, 10)}`)
console.log(`\nÀ REVÉRIFIER (${stale.length}) :`)
for (const r of stale) console.log(`  ${String(r.age ?? 'sans date').padStart(9)}  ${r.id}  ${r.url}`)
console.log(`\nLIENS PARTAGÉS PAR PLUSIEURS PRODUITS (${shared.length}) :`)
for (const [url, ids] of shared) console.log(`  ${url}\n    ${ids.join('\n    ')}`)

process.exit(stale.length || shared.length ? 1 : 0)
