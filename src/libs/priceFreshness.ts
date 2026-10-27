/**
 * Fraîcheur des prix des produits affiliés.
 *
 * Les prix des produits sont relevés à la main sur le site du marchand (pas de scraping :
 * contraire aux règles d'Amazon Partenaires). Chaque produit porte la date de son dernier
 * relevé (`priceCheckedAt`). Un prix sans date, ou relevé depuis trop longtemps, n'est pas affiché :
 * mieux vaut aucun prix qu'un prix faux. Fonctions pures (sans `astro:content`) pour rester testables.
 */

/** Âge maximal (en jours) d'un relevé avant que le prix ne soit masqué. */
export const PRICE_MAX_AGE_DAYS = 60

const DAY_MS = 24 * 60 * 60 * 1000

/** Nombre de jours entiers écoulés entre le relevé et `now` (négatif si le relevé est dans le futur). */
export function priceAgeDays(checkedAt: Date, now: Date = new Date()): number {
	return Math.floor((now.getTime() - checkedAt.getTime()) / DAY_MS)
}

/** Vrai si le relevé existe, a moins de `maxDays` jours et n'est pas daté de plus d'un jour dans le futur (décalage de fuseau toléré). */
export function isPriceFresh(checkedAt: Date | undefined, now: Date = new Date(), maxDays: number = PRICE_MAX_AGE_DAYS): boolean {
	if (!checkedAt || Number.isNaN(checkedAt.getTime())) return false
	const age = priceAgeDays(checkedAt, now)
	return age >= -1 && age <= maxDays
}

/** Date de relevé au format affiché sur le site : « 28/10/2026 ». */
export function formatCheckedAt(checkedAt: Date): string {
	return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(checkedAt)
}
