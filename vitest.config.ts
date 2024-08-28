/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'
// import { configDefaults } from 'vitest/config'

export default getViteConfig({
	test: {
		include: [
			'./tests/**.ts'
		]
		/* for example, use global to avoid globals imports (describe, test, expect): */
		// globals: true,
	},
});
