import node from '@astrojs/node'
import { defineConfig } from 'astro/config'
import routing from './hooks/routing'

// const faviconHook = {
// 	name: 'Favicon',
// 	hooks: {
// 		"astro:build:setup": async () => {
// 			await Manifest.create('./src/assets/favicon.png', {
// 				name: 'Template'
// 			})
// 		}
// 	}
// }

// https://astro.build/config
export default defineConfig({
	// Use the NodeJS adapter
	adapter: node({
		mode: 'standalone',
		// formulaires uniquement : 64 Ko suffisent (défaut de l'adaptateur : 1 Gio)
		bodySizeLimit: 64 * 1024
	}),

	// aucune session utilisée : évite l'activation du stockage de sessions sur disque
	session: false,

	// Hôtes acceptés pour reconstruire l'URL de la requête (sinon Astro 7 retombe sur http://localhost:3000
	// et son contrôle d'origine CSRF refuse les envois). L'IP cliente vient de `socketIp`, jamais de `clientAddress`.
	security: {
		allowedDomains: [{ hostname: 'trouve-ta-piece.fr', protocol: 'https' }, { hostname: 'localhost' }, { hostname: '127.0.0.1' }]
	},

	// some settings to the build output
	build: {
		// the asset path
		assets: 'assets',

		// inline the stylesheet if it is small enough
		inlineStylesheets: 'auto'
	},

	// Compress the HTML output
	compressHTML: true,

	// Redirections des anciennes URLs (v1 -> v2)
	redirects: {
		'/categorie/allDays': '/categorie/alldays',
		'/categorie/cycle/protegeMain': '/categorie/cycle/protege-main',
		'/product/produit': '/produit/nettoyant',
		'/product/config': '/categorie/alldays'
	},

	// Customizable depending on goal
	output: 'server',

	// TailwindCSS passe par PostCSS (postcss.config.cjs) : @astrojs/tailwind ne supporte pas Astro 6+
	integrations: [routing()],

	// prefetch links
	prefetch: {
		defaultStrategy: 'hover'
	},

	// the site url
	site: 'https://trouve-ta-piece.fr',

	// the Output server
	server: {
		host: true,
		port: 3000
	},

	// Remove the trailing slash by default
	trailingSlash: 'never',

	// Dev Server
	vite: {
		build: {
			// Astro 5+ inline les petits scripts dans le HTML : la CSP (script-src 'self') les bloquerait
			assetsInlineLimit: 0
		},
		server: {
			watch: {
				// Ignore some paths
				ignored: [],
				// support polling and WSL
				usePolling: !!(process.env.USE_POLLING ?? process.env.WSL_DISTRO_NAME)
			}
		}
	}
})
