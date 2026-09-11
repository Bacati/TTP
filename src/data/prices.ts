/**
 * Registre de prix — source unique de vérité.
 *
 * C'est le SEUL endroit où un prix est défini ou calculé. Partout ailleurs
 * (content collections, composants, pages) on référence une clé de ce registre
 * via `priceKey`, puis on résout avec `priceOf(key)` ou `configTotal(slug)`.
 *
 * Remplace l'ancien `src/libs/donner.ts` (mêmes valeurs, typé, sans les
 * dizaines d'exports « tableau d'un objet » de compatibilité).
 */

// ---------------------------------------------------------------------------
// 1. Prix unitaires (pièces générales, accessoires, produits simples)
// ---------------------------------------------------------------------------

export const PRICES = {
	// Pièces moteur générales
	roulement: 14,
	embrayage: 44,
	pipe: 14,
	carbu: 105,
	pot: 212,
	embrayageMost: 50,
	lamelleFibre: 10,
	carbu24: 110,
	potVoca: 279,
	clapetVl6: 33,
	lamelleCarbonne: 23,
	mvtdd: 289,
	potMost80: 246,
	roulementMost: 28,
	admiItalkit: 88,
	pvl: 399,
	vforce: 199,
	admiMost: 51,
	potMost70: 289,
	potTxtV8: 401,
	potTxtV21: 459,
	carbu32: 129,
	viloItal: 229,
	viloItal44: 250,

	// Accessoires & entretien (produits simples)
	clearPot: 7.99,
	mcAdelin: 66.5,
	progressif: 14.59,
	street: 23.99,
	greluma: 17.99,
	guidon: 21.99,
	autocollant: 16.99,
	kitNettoyage: 25,
	vulcanet: 43.99,
	wd: 9.99,
	wdSpray: 17.73,
	nettoyantFrein: 19.5,
	motul800: 21.3,
	autosol: 8,
	chaine: 15.5,
	graisse: 16.5,
	huileBoite: 19,
	cuir: 14.55,
	bougie: 8,
	brosse: 8.99,
	wd40: 5.9,
	pige: 49.99,
	alesage: 51.23,
	disque: 15.23,
	pied: 21.99,
	dynamo: 28.37,
	burette: 18.99,
	peteuse: 74.99,
	caisse: 139.05,
	montageRoulement: 39.99,
	extracteur: 20.99,
	branche3: 44.8,
	dayuan: 38.95,
	inertie: 49,
	dremel: 54.99,
	renvoie: 91,
	fraise: 16.87,
	k1: 142.99,
	rabat: 118.99,
	full9: 273.93,
	shark: 249.99,
	poli: 87.99,
	prettyle: 42.99,
	exc: 62.99,
	arriere: 28.99,
	barre: 3.99,
	yngia: 35.99,
	horse: 15.99,
	evomosa: 28.99,
	jfg: 25.99,
	barreAlu: 27.99,
	vent: 29.99,
	protec: 34.99,
	embro: 44.99,
	woostar: 119.2,
	universal: 28.2,
	rcs: 105.9,
	clutch: 54.59,
	madbike: 7.99,
	support: 34.99,
	supportTel: 79.99,
	appli: 4.09,
	cagoule: 9.99,
	antivol: 37.99,
	cardo: 93.99,
	gonfleur: 39.99,
	stand: 59.99,
	vis: 35,
	housse: 279,
	calePied: 189,
	calePiedPro: 318,
	leveMoto: 153,
	grille: 330,
	elevateur: 154,
	start: 83
} as const

export type PriceKey = keyof typeof PRICES

// ---------------------------------------------------------------------------
// 2. Kits (cylindre + vilo + éventuels sous-composants propres à un kit)
// ---------------------------------------------------------------------------

const KITS = {
	all50Mk: { cylindre: 230, carbu: 118 },
	all70top: { cylindre: 188, vilo: 105 },
	all70airsal: { cylindre: 131, vilo: 77 },
	all70airsalAlu: { cylindre: 132, vilo: 128 },
	all75TopRose: { cylindre: 289, vilo: 129 },
	all78Airsal: { cylindre: 219, vilo: 129 },
	all78brk: { cylindre: 257, vilo: 162 },
	allTopalu: { pack: 426, embrayage: 65, bacTop: 97, pipeMost: 47, pot2win: 329 },
	all78Most: { cylindre: 249, vilo: 199 },

	compet50Doppler: { cylindre: 249, vilo: 129 },
	compet50Mhr: { cylindre: 407, vilo: 129 },
	compet50Wr: { cylindre: 417, vilo: 280, pot: 440 },
	compet70Fast: { cylindre: 492 },
	compet70Wr: { cylindre: 384 },
	compet70ProRace: { cylindre: 302 },
	compet78xtrem: { cylindre: 265 },
	compet78mhr: { cylindre: 398 },
	compet78most: { cylindre: 249 },
	compet80fast: { cylindre: 499 },
	compet80wr: { cylindre: 419 },
	compet90wr: { cylindre: 481, viloItal44: 250 },
	compet90fast: { cylindre: 520, viloItal44: 250 },
	compet100fast: { cylindre: 520, vilo: 476 },
	compet96bida: { cylindre: 481, vilo: 350 }
} as const satisfies Record<string, Record<string, number>>

type KitKey = keyof typeof KITS

// Packs de pièces communs aux grosses configs compétition
const general70 = ['viloItal', 'carbu32', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potTxtV8'] as const
const general80 = ['viloItal44', 'carbu32', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potTxtV8'] as const
const general90 = ['carbu32', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potTxtV21'] as const

// ---------------------------------------------------------------------------
// 3. Résolution
// ---------------------------------------------------------------------------

const round2 = (n: number) => Math.round(n * 100) / 100
const sum = (values: Array<number>) => values.reduce((a, b) => a + b, 0)

/** Prix unitaire d'une clé du registre. */
export function priceOf(key: PriceKey): number {
	return PRICES[key]
}

/** Total d'un kit = somme de ses sous-composants + éventuelles pièces générales. */
function kitTotal(kit: KitKey, extras: ReadonlyArray<PriceKey | ReadonlyArray<PriceKey>>): number {
	let total = sum(Object.values(KITS[kit]))
	for (const extra of extras) {
		if (Array.isArray(extra)) total += sum((extra as ReadonlyArray<PriceKey>).map((k) => PRICES[k]))
		else total += PRICES[extra as PriceKey]
	}
	return round2(total)
}

/**
 * Coût total d'une config moteur, par slug d'entrée `engineConfigs`.
 * (équivalent de l'ancien `config[0].allXxx` / `config[0].competXxx`)
 */
export const CONFIG_TOTALS: Record<string, number> = {
	// Alldays
	'50-metrakit-alu': kitTotal('all50Mk', ['pot']),
	'70-top-performance': kitTotal('all70top', ['pot', 'roulement', 'embrayage', 'pipe', 'carbu']),
	'70-airsal-fonte': kitTotal('all70airsal', ['pot', 'roulement', 'embrayage', 'pipe', 'carbu']),
	'70-airsal-alu': kitTotal('all70airsalAlu', ['potVoca', 'roulement', 'embrayageMost', 'lamelleFibre', 'pipe', 'carbu24']),
	'75-top-performance-rose': kitTotal('all75TopRose', ['potVoca', 'roulement', 'embrayageMost', 'clapetVl6', 'pipe', 'carbu24']),
	'78-airsal-alu-tech': kitTotal('all78Airsal', ['potVoca', 'roulement', 'embrayageMost', 'lamelleCarbonne', 'pipe', 'carbu24']),
	'78-brk-4race': kitTotal('all78brk', ['potMost80', 'embrayageMost', 'carbu24', 'mvtdd', 'roulementMost', 'admiItalkit']),
	'86-top-performance-alu': kitTotal('allTopalu', ['carbu24']),
	'78-most-4street': kitTotal('all78Most', ['carbu24', 'potMost80', 'embrayageMost', 'mvtdd', 'roulementMost', 'admiItalkit']),

	// Compétition
	'50-doppler-vortex': kitTotal('compet50Doppler', ['carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potMost70']),
	'50-malossi-mhr-team': kitTotal('compet50Mhr', ['carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potMost70']),
	'50-bidalot-wr': kitTotal('compet50Wr', ['carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost']),
	'70-2fast': kitTotal('compet70Fast', [general70]),
	'70-bidalot-wr': kitTotal('compet70Wr', [general70]),
	'70-metrakit-pro-race': kitTotal('compet70ProRace', [general70]),
	'78-airsal-xtrem': kitTotal('compet78xtrem', [general70]),
	'78-malossi-mhr-team': kitTotal('compet78mhr', [general70]),
	'78-most-4street-competition': kitTotal('compet78most', [general70]),
	'80-2fast': kitTotal('compet80fast', [general80]),
	'80-bidalot-wr': kitTotal('compet80wr', [general80]),
	'90-bidalot-wr': kitTotal('compet90wr', [general90]),
	'90-2fast': kitTotal('compet90fast', [general90]),
	'100-2fast': kitTotal('compet100fast', [general90]),
	'96-bidalot-wr': kitTotal('compet96bida', [general90])
}

/** Coût total d'une config moteur (ou `undefined` si slug inconnu). */
export function configTotal(slug: string): number | undefined {
	return CONFIG_TOTALS[slug]
}
