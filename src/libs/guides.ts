/**
 * Accès aux guides (collection `guides`, fichiers Markdown de `src/content/guides/`).
 * Comme `catalog.ts` pour le catalogue, c'est la seule couche que les pages et
 * layouts consomment : elles ne touchent jamais `getCollection` directement.
 *
 * Les fonctions « pures » (sommaire, dates, temps de lecture) sont exportées
 * à part pour être testées sans Astro (`tests/libs/guides.test.ts`).
 */
import { type CollectionEntry, getCollection, render } from 'astro:content'
import type { MarkdownHeading } from 'astro'
import { type CardModel, productToCard } from './catalog'

export type GuideEntry = CollectionEntry<'guides'>

/** Entrée du sommaire d'un guide (ancre + libellé). */
export interface TocItem {
	slug: string
	text: string
}

/** Ancres des sections ajoutées par `GuideLayout` après le contenu Markdown. */
export const TOOLS_ANCHOR = 'outils'
export const SOURCES_ANCHOR = 'sources'

// à `order` égal, ordre alphabétique de l'identifiant : le loader glob ne garantit pas l'ordre du dossier
const byOrder = (a: GuideEntry, b: GuideEntry) => a.data.order - b.data.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

export async function getGuides(): Promise<Array<GuideEntry>> {
	return (await getCollection('guides')).sort(byOrder)
}

export async function getGuide(id: string): Promise<GuideEntry | undefined> {
	return (await getCollection('guides')).find((g) => g.id === id)
}

/** Autres guides (bloc « Pour aller plus loin »), dans l'ordre éditorial. */
export async function getOtherGuides(id: string, limit = 3): Promise<Array<GuideEntry>> {
	return (await getGuides()).filter((g) => g.id !== id).slice(0, limit)
}

/** Contenu Markdown compilé + titres (pour le sommaire). */
export async function renderGuide(entry: GuideEntry) {
	const { Content, headings } = await render(entry)
	return { Content, headings }
}

/**
 * Cartes des produits recommandés par un guide, dans l'ordre du frontmatter.
 * Le schéma valide déjà les références ; l'erreur ci-dessous protège contre un
 * produit supprimé du catalogue après coup (le build échoue au lieu d'afficher un trou).
 */
export async function getGuideProductCards(entry: GuideEntry): Promise<Array<CardModel>> {
	if (entry.data.products.length === 0) return []
	const products = await getCollection('products')
	return entry.data.products.map((ref) => {
		const product = products.find((p) => p.id === ref.id)
		if (!product) throw new Error(`Guide « ${entry.id} » : produit « ${ref.id} » introuvable dans src/content/products/`)
		return productToCard(product)
	})
}

// --- fonctions pures ---------------------------------------------

/**
 * Sommaire : titres de niveau 2 du Markdown, puis les sections ajoutées par le
 * layout (« Outils et produits utiles » si le guide recommande des produits, « Sources »).
 */
export function buildToc(headings: Array<MarkdownHeading>, options: { hasProducts: boolean }): Array<TocItem> {
	const items: Array<TocItem> = headings.filter((h) => h.depth === 2).map((h) => ({ slug: h.slug, text: h.text }))
	if (options.hasProducts) items.push({ slug: TOOLS_ANCHOR, text: 'Outils et produits utiles' })
	items.push({ slug: SOURCES_ANCHOR, text: 'Sources' })
	return items
}

/** Date longue en français (« 27 octobre 2026 »). Les dates YAML sont à minuit UTC : on formate en UTC. */
export function formatGuideDate(date: Date): string {
	return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

/** Date ISO courte (AAAA-MM-JJ) pour `<time datetime>` et le JSON-LD. */
export function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10)
}

/** Nombre de mots d'un texte Markdown (balises HTML et syntaxe Markdown ignorées). */
export function countWords(markdown: string): number {
	const text = markdown
		.replace(/<[^>]+>/g, ' ')
		.replace(/\]\([^)]*\)/g, ' ')
		.replace(/[#>*_|`[\]-]+/g, ' ')
	return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

/** Temps de lecture arrondi à la minute supérieure (200 mots par minute, minimum 1). */
export function readingMinutes(markdown: string, wordsPerMinute = 200): number {
	return Math.max(1, Math.ceil(countWords(markdown) / wordsPerMinute))
}
