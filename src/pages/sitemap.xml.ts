import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import Sitemap from 'easy-sitemap'
import { hasProductPage, productSlug } from 'libs/catalog'
import { getGuides } from 'libs/guides'

export const GET: APIRoute = async () => {
	const sitemap = new Sitemap('https://trouve-ta-piece.fr')

	sitemap.addEntry('/', { changefreq: 'weekly', priority: 1 })
	sitemap.addEntry('/categorie/astuce', { changefreq: 'monthly', priority: 0.6 })
	sitemap.addEntry('/controle-technique', { changefreq: 'monthly', priority: 0.8 })
	sitemap.addEntry('/mentions-legales', { changefreq: 'yearly', priority: 0.1 })
	sitemap.addEntry('/guides', { changefreq: 'monthly', priority: 0.7 })
	for (const guide of await getGuides()) {
		sitemap.addEntry(`/guides/${guide.id}`, { changefreq: 'monthly', priority: 0.7, lastmod: guide.data.updated })
	}

	for (const category of await getCollection('categories')) {
		sitemap.addEntry(`/categorie/${category.id}`, { changefreq: 'weekly', priority: 0.8 })
	}
	for (const config of await getCollection('engineConfigs')) {
		sitemap.addEntry(`/config/${config.id}`, { changefreq: 'monthly', priority: 0.7 })
	}
	for (const product of await getCollection('products')) {
		if (hasProductPage(product)) {
			sitemap.addEntry(`/produit/${productSlug(product)}`, { changefreq: 'monthly', priority: 0.6 })
		}
	}

	return new Response(sitemap.build(), {
		status: 200,
		headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
	})
}

// certains outils (et curl -I) testent le sitemap en HEAD
export const HEAD: APIRoute = async (context) => {
	const res = await GET(context)
	return new Response(null, { status: res.status, headers: res.headers })
}
