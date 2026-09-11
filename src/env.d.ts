/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

/**
 * Environment variables declaration
 */
type ImportMetaEnv = {}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare namespace App {
	/**
	 * Middlewares variables
	 */
	type Locals = {}
}
