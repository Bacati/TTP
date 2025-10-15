import type { APIRoute } from 'astro'
import Sitemap from 'easy-sitemap'
import ResponseBuilder from 'libs/ResponseBuilder'

export const ALL: APIRoute = async () => {
	const sitemap = new Sitemap('https://trouve-ta-piece.fr')

	sitemap.addEntry('/')
	sitemap.addEntry('/categorie/allDays')
	sitemap.addEntry('/categorie/competition')
	sitemap.addEntry('/categorie/esthetique')
	sitemap.addEntry('/categorie/cycle')
	sitemap.addEntry('/categorie/equipement')
	sitemap.addEntry('/categorie/accessoires-racing')
	sitemap.addEntry('/product')
	sitemap.addEntry('/categorie/produit-outillage')

	return new ResponseBuilder()
		.body(sitemap.build())
		.addHeader('Content-Type', 'application/xml')
		.status(200)
		.build()
}
