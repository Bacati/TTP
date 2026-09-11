import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import Sitemap from 'easy-sitemap'
import ResponseBuilder from 'libs/ResponseBuilder'

export const ALL: APIRoute = async () => {
	const sitemap = new Sitemap('https://trouve-ta-piece.fr')

	sitemap.addEntry('/')
	sitemap.addEntry('/categorie/astuce')

	for (const category of await getCollection('categories')) {
		sitemap.addEntry(`/categorie/${category.id}`)
	}
	for (const config of await getCollection('engineConfigs')) {
		sitemap.addEntry(`/config/${config.id}`)
	}
	for (const product of await getCollection('products')) {
		if (product.data.body && product.data.link.type === 'product') {
			sitemap.addEntry(`/produit/${product.data.link.slug}`)
		}
	}

	return new ResponseBuilder().body(sitemap.build()).addHeader('Content-Type', 'application/xml').status(200).build()
}
