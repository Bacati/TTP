import { defineCollection, reference } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { PRICES } from './data/prices'

/**
 * Clés autorisées pour `priceKey` : celles du registre `src/data/prices.ts`.
 * On garde un simple `z.string()` (les clés sont validées au rendu via `priceOf`)
 * mais on documente l'intention ici.
 */
const priceKey = z.enum(Object.keys(PRICES) as [string, ...Array<string>])

/** Cible d'un lien de carte produit. */
const linkSchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('external'), url: z.string().url() }),
	z.object({ type: z.literal('config'), slug: z.string() }),
	z.object({ type: z.literal('product'), slug: z.string() })
])

/** Une pièce dans le détail d'une config moteur. */
const pieceSchema = z.object({
	label: z.string(),
	priceKey: priceKey.optional(),
	price: z.number().optional()
})

/**
 * categories — l'arbre de navigation.
 *
 * - `hub`      : page vitrine listant ses sous-catégories + ses partenaires
 *               (ex. Cycle, Garage, Équipement, Esthétique, Accessoires).
 * - `configs`  : grille filtrable de configs moteur (Alldays, Compétition).
 * - `products` : grille filtrable de produits (ex. Freinage, Clignotants…).
 */
const categories = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			title: z.string(),
			intro: z.string(),
			heroImage: image(),
			heroImageAlt: z.string(),
			/** cadrage de l'image d'entête (défaut : "center"). */
			heroPosition: z.enum(['center', 'top', 'bottom', 'left', 'right']).default('center'),
			/** image utilisée pour la tuile de cette catégorie sur la page `hub` parente (défaut : `heroImage`). */
			tileImage: image().optional(),
			tileImageAlt: z.string().optional(),
			layout: z.enum(['hub', 'configs', 'products']),
			/** rendu des tuiles sur une page `hub` : "tile" (image plein cadre) ou "product" (carte produit). */
			partnerStyle: z.enum(['tile', 'product']).default('tile'),
			/** slug de la catégorie parente (pour les sous-catégories). */
			parent: reference('categories').optional(),
			/** facettes de filtre actives sur cette page. */
			filters: z.array(z.enum(['cc', 'engine', 'price'])).default([]),
			/** pour layout `configs` : quelle gamme afficher. */
			configRange: z.enum(['alldays', 'competition']).optional(),
			/** exclue cette sous-catégorie de la grille de tuiles de son `hub` parent (page toujours accessible par son URL directe). */
			hidden: z.boolean().default(false),
			order: z.number().default(0)
		})
})

/**
 * products — catalogue unifié (ex-`src/libs/{frein,meca,clignotant,…}.ts`).
 */
const products = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			image: image(),
			imageAlt: z.string(),
			brandLogo: image().optional(),
			brandLogoAlt: z.string().optional(),
			/** marque du produit (données structurées `Product.brand`) : seulement si elle figure dans le titre. */
			brand: z.string().optional(),
			tagline: z.string().optional(),
			category: reference('categories'),
			cc: z.number().optional(),
			engines: z.array(z.string()).default([]),
			priceKey: priceKey.optional(),
			price: z.number().optional(),
			/** date du dernier relevé du prix sur le site du marchand (AAAA-MM-JJ). Sans date récente, le prix n'est pas affiché (cf. `libs/priceFreshness.ts`). */
			priceCheckedAt: z.coerce.date().optional(),
			link: linkSchema,
			featured: z.boolean().default(false),
			order: z.number().default(0),
			/** contenu HTML de la fiche `/produit/<slug>` (p, h2, ul, li, strong). Présent = la carte mène à cette fiche ; la 1re `<p>` sert de meta description. */
			body: z.string().optional(),
			gallery: z.array(image()).default([])
		})
})

/**
 * engineConfigs — configs moteur Alldays + Compétition
 * (ex-`src/libs/configurations.ts` + `src/libs/configCompetition.ts`, fusionnés).
 */
const engineConfigs = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/engineConfigs' }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			range: z.enum(['alldays', 'competition']),
			brand: z.string(),
			brandLogo: image(),
			cc: z.number(),
			engines: z.array(z.string()).default([]),
			description: z.string(),
			images: z.array(image()).min(1),
			pieces: z.array(pieceSchema).default([]),
			featured: z.boolean().default(false),
			order: z.number().default(0)
		})
})

/**
 * partners — encarts affiliés / marques (ex. GXS, LMR, Alpinestars, Muc-Off…)
 * et tuiles de renvoi affichées sur les pages `hub`.
 */
const partners = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/partners' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			image: image(),
			imageAlt: z.string(),
			logo: image().optional(),
			logoAlt: z.string().optional(),
			tagline: z.string(),
			/** lien externe ; absent = tuile "bientôt disponible". */
			url: z.string().optional(),
			category: reference('categories'),
			/** exclu des pages `hub` (reste consultable depuis la recherche globale). */
			hidden: z.boolean().default(false),
			order: z.number().default(0)
		})
})

/**
 * guides — articles éditoriaux en Markdown (`src/content/guides/<slug>.md`), servis
 * par `src/pages/guides/[slug].astro` via `src/libs/guides.ts`. Le contenu commence au
 * niveau h2 (le h1 vient du layout `GuideLayout`).
 */
const guides = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
	schema: z.object({
		title: z.string(),
		/** meta description : 155 caractères maximum. */
		description: z.string().max(155),
		/** date de dernière mise à jour (AAAA-MM-JJ). */
		updated: z.coerce.date(),
		/** puces de l'encadré « En bref » sous le titre. */
		summary: z.array(z.string()).min(3).max(5),
		/** produits du catalogue recommandés (ids de `src/content/products/`) ; liste vide autorisée. */
		products: z.array(reference('products')).default([]),
		/** phrase d'introduction de la section « Outils et produits utiles » (optionnelle). */
		toolsIntro: z.string().optional(),
		sources: z.array(z.object({ label: z.string(), url: z.string().url() })).min(1),
		order: z.number().default(0)
	})
})

export const collections = { categories, products, engineConfigs, partners, guides }
