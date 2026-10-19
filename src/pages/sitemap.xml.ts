import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import Sitemap from 'easy-sitemap'

export const GET: APIRoute = async () => {
	const sitemap = new Sitemap('https://trouve-ta-piece.fr')

	sitemap.addEntry('/', { changefreq: 'weekly', priority: 1 })
	sitemap.addEntry('/categorie/astuce', { changefreq: 'monthly', priority: 0.6 })
	sitemap.addEntry('/controle-technique', { changefreq: 'monthly', priority: 0.8 })
	sitemap.addEntry('/mentions-legales', { changefreq: 'yearly', priority: 0.1 })

	for (const category of await getCollection('categories')) {
		sitemap.addEntry(`/categorie/${category.id}`, { changefreq: 'weekly', priority: 0.8 })
	}
	for (const config of await getCollection('engineConfigs')) {
		sitemap.addEntry(`/config/${config.id}`, { changefreq: 'monthly', priority: 0.7 })
	}
	for (const product of await getCollection('products')) {
		if (product.data.body && product.data.link.type === 'product') {
			sitemap.addEntry(`/produit/${product.data.link.slug}`, { changefreq: 'monthly', priority: 0.6 })
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
