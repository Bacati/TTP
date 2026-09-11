/**
 * Accès unifié au catalogue (content collections) + résolution prix / liens /
 * facettes de filtre. C'est la seule couche que les pages et composants
 * consomment — elles ne touchent jamais `getCollection` directement.
 */
import { type CollectionEntry, getCollection } from 'astro:content'
import type { ImageMetadata } from 'astro'
import { type PriceKey, configTotal, priceOf } from '../data/prices'

export type CategoryEntry = CollectionEntry<'categories'>
export type ProductEntry = CollectionEntry<'products'>
export type EngineConfigEntry = CollectionEntry<'engineConfigs'>
export type PartnerEntry = CollectionEntry<'partners'>

/** Modèle plat consommé par `<ProductCard>` (produits ET configs moteur). */
export interface CardModel {
	title: string
	image: ImageMetadata
	imageAlt: string
	brandLogo?: ImageMetadata | undefined
	brandLogoAlt?: string | undefined
	/** ligne grise sous le titre (ex. accroche produit ou "Configuration Alldays") */
	typeLabel?: string | undefined
	price?: number | undefined
	href: string
	external: boolean
	cc?: number | undefined
	engines: Array<string>
	priceBucket?: string | undefined
}

// --- tranches de prix (facette `price`) ------------------------------

export const PRICE_BUCKETS = [
	{ id: '0-200', label: 'Moins de 200 €', min: 0, max: 200 },
	{ id: '200-500', label: '200 – 500 €', min: 200, max: 500 },
	{ id: '500-700', label: '500 – 700 €', min: 500, max: 700 },
	{ id: '700-1000', label: '700 – 1000 €', min: 700, max: 1000 },
	{ id: '1000+', label: 'Plus de 1000 €', min: 1000, max: Number.POSITIVE_INFINITY }
] as const

export function priceBucketOf(price: number | undefined): string | undefined {
	if (price == null) return undefined
	return PRICE_BUCKETS.find((b) => price >= b.min && price < b.max)?.id
}

// --- prix ----------------------------------------------------------

export function resolvePrice(data: { priceKey?: string | undefined; price?: number | undefined }): number | undefined {
	if (typeof data.price === 'number') return data.price
	if (data.priceKey) return priceOf(data.priceKey as PriceKey)
	return undefined
}

/** Coût total d'une config = somme des pièces (fallback : registre `configTotal`). */
export function engineConfigTotal(entry: EngineConfigEntry): number | undefined {
	const fromRegistry = configTotal(entry.id)
	if (fromRegistry != null) return fromRegistry
	if (entry.data.pieces.length) {
		return Math.round(entry.data.pieces.reduce((sum, p) => sum + (resolvePrice(p) ?? 0), 0) * 100) / 100
	}
	return undefined
}

// --- liens -------------------------------------------------------

export function resolveProductHref(link: ProductEntry['data']['link']): string {
	switch (link.type) {
		case 'external':
			return link.url
		case 'config':
			return `/config/${link.slug}`
		case 'product':
			return `/produit/${link.slug}`
	}
}

// --- catégories ------------------------------------------------

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order

export async function getCategories(): Promise<Array<CategoryEntry>> {
	return (await getCollection('categories')).sort(byOrder)
}

export async function getCategory(id: string): Promise<CategoryEntry | undefined> {
	return (await getCollection('categories')).find((c) => c.id === id)
}

export async function getTopCategories(): Promise<Array<CategoryEntry>> {
	return (await getCategories()).filter((c) => !c.data.parent)
}

export async function getChildCategories(parentId: string): Promise<Array<CategoryEntry>> {
	return (await getCategories()).filter((c) => c.data.parent?.id === parentId && !c.data.hidden)
}

// --- partenaires ---------------------------------------------

export async function getPartnersForCategory(categoryId: string): Promise<Array<PartnerEntry>> {
	return (await getCollection('partners')).filter((p) => p.data.category.id === categoryId && !p.data.hidden).sort(byOrder)
}

/** Partenaire rendu comme une carte produit (page `hub` avec `partnerStyle: "product"`). */
export function partnerToCard(entry: PartnerEntry): CardModel {
	const url = entry.data.url
	return {
		title: entry.data.title,
		image: entry.data.image,
		imageAlt: entry.data.imageAlt,
		brandLogo: entry.data.logo,
		brandLogoAlt: entry.data.logoAlt,
		typeLabel: entry.data.tagline,
		href: url ?? `/categorie/${entry.data.category.id}`,
		external: url ? /^https?:\/\//.test(url) : false,
		engines: []
	}
}

// --- produits ----------------------------------------------

export async function getProductsForCategory(categoryId: string): Promise<Array<ProductEntry>> {
	return (await getCollection('products')).filter((p) => p.data.category.id === categoryId).sort(byOrder)
}

export async function getFeaturedProducts(): Promise<Array<ProductEntry>> {
	return (await getCollection('products')).filter((p) => p.data.featured).sort(byOrder)
}

/** Cartes "à la une" pour la home : configs moteur + produits marqués `featured`. */
export async function getFeaturedCards(): Promise<Array<CardModel>> {
	const configs = (await getCollection('engineConfigs')).filter((c) => c.data.featured).sort(byOrder)
	const products = await getFeaturedProducts()
	return [...configs.map(engineConfigToCard), ...products.map(productToCard)]
}

export function productToCard(entry: ProductEntry): CardModel {
	const price = resolvePrice(entry.data)
	return {
		title: entry.data.title,
		image: entry.data.image,
		imageAlt: entry.data.imageAlt,
		brandLogo: entry.data.brandLogo,
		brandLogoAlt: entry.data.brandLogoAlt,
		typeLabel: entry.data.tagline,
		price,
		href: resolveProductHref(entry.data.link),
		external: entry.data.link.type === 'external',
		cc: entry.data.cc,
		engines: entry.data.engines,
		priceBucket: priceBucketOf(price)
	}
}

// --- configs moteur --------------------------------------

export async function getEngineConfigs(range: 'alldays' | 'competition'): Promise<Array<EngineConfigEntry>> {
	return (await getCollection('engineConfigs')).filter((c) => c.data.range === range).sort(byOrder)
}

export async function getEngineConfig(id: string): Promise<EngineConfigEntry | undefined> {
	return (await getCollection('engineConfigs')).find((c) => c.id === id)
}

export function engineConfigToCard(entry: EngineConfigEntry): CardModel {
	const price = engineConfigTotal(entry)
	return {
		title: entry.data.name,
		// biome-ignore lint/style/noNonNullAssertion: `images` est `.min(1)` dans le schéma de la collection
		image: entry.data.images[0]!,
		imageAlt: entry.data.name,
		brandLogo: entry.data.brandLogo,
		brandLogoAlt: entry.data.brand,
		typeLabel: entry.data.range === 'alldays' ? 'Configuration Alldays' : 'Compétition',
		price,
		href: `/config/${entry.id}`,
		external: false,
		cc: entry.data.cc,
		engines: entry.data.engines,
		priceBucket: priceBucketOf(price)
	}
}

// --- facettes de filtre ------------------------------

export interface Facets {
	cc: Array<number>
	engine: Array<string>
	price: Array<{ id: string; label: string }>
}

export function getFacets(cards: Array<CardModel>): Facets {
	const cc = new Set<number>()
	const engine = new Set<string>()
	const price = new Set<string>()
	for (const c of cards) {
		if (c.cc) cc.add(c.cc)
		for (const e of c.engines) engine.add(e)
		if (c.priceBucket) price.add(c.priceBucket)
	}
	return {
		cc: [...cc].sort((a, b) => a - b),
		engine: [...engine].sort(),
		price: PRICE_BUCKETS.filter((b) => price.has(b.id)).map((b) => ({ id: b.id, label: b.label }))
	}
}
