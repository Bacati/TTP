// On centralise tout ici. C'est le seul endroit à modifier pour changer un prix général.
const prices = {
	// Pièces générales
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
	
	// Accessoires & Entretien (Produits simples)
	nettoyant: 7.99,
	maitre: 66.5,
	cligno_progressif: 14.59,
	cligno_street: 23.99,
	cligno_greluma: 17.99,
	cligno_guidon: 21.99,
	cligno_autocollant: 16.99,
	kitNettoyage: 38,
	vulcanet: 43.99,
	wd: 9.99,
	wdSpray: 17.73,
	nettoyantFrein: 19.50,
	motul800: 21.30,
	autosol: 8,
	chaine: 19,
	graisse: 21,
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
	branche3: 44.80,
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
	woostar: 119.20,
	universal: 28.20,
	rcs: 105.90,
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
	start: 83,
  };
  
  // --- 2. FONCTION DE CALCUL (Le moteur) ---
  // Calcule le prix total en additionnant les objets et les clés
  const calc = (specificObj: any, ...extras: (object | string)[]) => {
	let total = Object.values(specificObj).reduce((a: number, b: any) => a + b, 0);
	
	extras.forEach(item => {
	  if (typeof item === 'string') {
		// Si c'est une clé (ex: 'pot'), on cherche dans prices
		total += prices[item as keyof typeof prices] || 0;
	  } else {
		// Si c'est un objet (ex: general70), on additionne ses valeurs
		total += Object.values(item).reduce((a: number, b: any) => a + b, 0);
	  }
	});
	// Arrondi pour éviter les erreurs de flottants (ex: 19.9900004)
	return Math.round(total * 100) / 100;
  };
  
  // --- 3. DÉFINITION DES COMPOSANTS (Interne) ---
  // On définit les objets simples ici pour s'en servir dans les calculs ET les exports
  const defs = {
	all50Mk: { cylindre: 230, carbu: 118 },
	all70top: { cylindre: 188, vilo: 105 },
	all70airsal: { cylindre: 131, vilo: 77 },
	all70airsalAlu: { cylindre: 132, vilo: 128 },
	all75TopRose: { cylindre: 289, vilo: 129 },
	all78Airsal: { cylindre: 219, vilo: 129 },
	all78brk: { cylindre: 257, vilo: 162 },
	allTopalu: { pack: 426, embrayage: 65, bacTop: 97, pipeMost: 47, pot2win: 329 },
	all78Most: { cylindre: 249, vilo: 199 },
	
	// Compétition
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
	compet96bida: { cylindre: 481, vilo: 350 },
  };
  
  // Les packs généraux (Objets, comme dans votre original)
  export const general70 = { viloItal: prices.viloItal, carbu32: prices.carbu32, roulementMost: prices.roulementMost, pvl: prices.pvl, embrayageMost: prices.embrayageMost, vforce: prices.vforce, admiMost: prices.admiMost, potTxtV8: prices.potTxtV8 };
  export const general80 = { viloItal44: prices.viloItal44, carbu32: prices.carbu32, roulementMost: prices.roulementMost, pvl: prices.pvl, embrayageMost: prices.embrayageMost, vforce: prices.vforce, admiMost: prices.admiMost, potTxtV8: prices.potTxtV8 };
  export const general90 = { carbu32: prices.carbu32, roulementMost: prices.roulementMost, pvl: prices.pvl, embrayageMost: prices.embrayageMost, vforce: prices.vforce, admiMost: prices.admiMost, potTxtV21: prices.potTxtV21 };
  
  // --- 4. EXPORTS COMPATIBLES (Tableaux d'objets) ---
  
  // Export general (Array wrapper pour compatibilité general[0])
  export const general = [prices];
  
  // Exports des Kits (Array wrapper pour compatibilité all50Mk[0])
  export const all50Mk = [defs.all50Mk];
  export const all70top = [defs.all70top];
  export const all70airsal = [defs.all70airsal];
  export const all70airsalAlu = [defs.all70airsalAlu];
  export const all75TopRose = [defs.all75TopRose];
  export const all78Airsal = [defs.all78Airsal];
  export const all78brk = [defs.all78brk];
  export const allTopalu = [defs.allTopalu];
  export const all78Most = [defs.all78Most];
  export const compet50Doppler = [defs.compet50Doppler];
  export const compet50Mhr = [defs.compet50Mhr];
  export const compet50Wr = [defs.compet50Wr];
  export const compet70Fast = [defs.compet70Fast];
  export const compet70Wr = [defs.compet70Wr];
  export const compet70ProRace = [defs.compet70ProRace];
  export const compet78xtrem = [defs.compet78xtrem];
  export const compet78mhr = [defs.compet78mhr];
  export const compet78most = [defs.compet78most];
  export const compet80fast = [defs.compet80fast];
  export const compet80wr = [defs.compet80wr];
  export const compet90wr = [defs.compet90wr];
  export const compet90fast = [defs.compet90fast];
  export const compet100fast = [defs.compet100fast];
  export const compet96bida = [defs.compet96bida];
  
  // Exports des Produits Simples (Array wrapper pour compatibilité)
  // Dans votre ancien code, vous utilisiez souvent la clé "cligno" ou "nettoyant", je mappe tout ça.
  export const clearPot = [{ nettoyant: prices.nettoyant }];
  export const mcAdelin = [{ maitre: prices.maitre }];
  // Génération automatique pour tous les produits qui utilisent la clé 'cligno' dans votre original
  const makeExport = (key: keyof typeof prices) => [{ cligno: prices[key] }];
  
  export const progressif = makeExport('cligno_progressif');
  export const street = makeExport('cligno_street');
  export const greluma = makeExport('cligno_greluma');
  export const guidon = makeExport('cligno_guidon');
  export const autocollant = makeExport('cligno_autocollant');
  export const kitNettoyage = makeExport('kitNettoyage');
  export const vulcanet = makeExport('vulcanet');
  export const wd = makeExport('wd');
  export const wdSpray = makeExport('wdSpray');
  export const nettoyantFrein = makeExport('nettoyantFrein');
  export const motul800 = makeExport('motul800');
  export const autosol = makeExport('autosol');
  export const chaine = makeExport('chaine');
  export const graisse = makeExport('graisse');
  export const huileBoite = makeExport('huileBoite');
  export const cuir = makeExport('cuir');
  export const bougie = makeExport('bougie');
  export const brosse = makeExport('brosse');
  export const wd40 = makeExport('wd40');
  export const pige = makeExport('pige');
  export const alesage = makeExport('alesage');
  export const disque = makeExport('disque');
  export const pied = makeExport('pied');
  export const dynamo = makeExport('dynamo');
  export const burette = makeExport('burette');
  export const peteuse = makeExport('peteuse');
  export const caisse = makeExport('caisse');
  export const montageRoulement = makeExport('montageRoulement');
  export const extracteur = makeExport('extracteur');
  export const branche3 = makeExport('branche3');
  export const dayuan = makeExport('dayuan');
  export const inertie = makeExport('inertie');
  export const dremel = makeExport('dremel');
  export const renvoie = makeExport('renvoie');
  export const fraise = makeExport('fraise');
  export const k1 = makeExport('k1');
  export const rabat = makeExport('rabat');
  export const full9 = makeExport('full9');
  export const shark = makeExport('shark');
  export const poli = makeExport('poli');
  export const prettyle = makeExport('prettyle');
  export const exc = makeExport('exc');
  export const arriere = makeExport('arriere');
  export const barre = makeExport('barre');
  export const yngia = makeExport('yngia');
  export const horse = makeExport('horse');
  export const evomosa = makeExport('evomosa');
  export const jfg = makeExport('jfg');
  export const barreAlu = makeExport('barreAlu');
  export const vent = makeExport('vent');
  export const protec = makeExport('protec');
  export const embro = makeExport('embro');
  export const woostar = makeExport('woostar');
  export const universal = makeExport('universal');
  export const rcs = makeExport('rcs');
  export const clutch = makeExport('clutch');
  export const madbike = makeExport('madbike');
  export const support = makeExport('support');
  export const supportTel = makeExport('supportTel');
  export const appli = makeExport('appli');
  export const cagoule = makeExport('cagoule');
  export const antivol = makeExport('antivol');
  export const cardo = makeExport('cardo');
  export const gonfleur = makeExport('gonfleur');
  export const stand = makeExport('stand');
  export const vis = makeExport('vis');
  export const housse = makeExport('housse');
  export const calePied = makeExport('calePied');
  export const calePiedPro = makeExport('calePiedPro');
  export const leveMoto = makeExport('leveMoto');
  export const grille = makeExport('grille');
  export const elevateur = makeExport('elevateur');
  export const start = makeExport('start');
  
  // --- 5. EXPORT CONFIG (Calculs finaux) ---
  // C'est ce tableau que vous utilisez le plus souvent (config[0]?.key)
  export const config = [
	{
	  allMk:           calc(defs.all50Mk, 'pot'),
	  allTop:          calc(defs.all70top, 'pot', 'roulement', 'embrayage', 'pipe', 'carbu'),
	  allAirsal:       calc(defs.all70airsal, 'pot', 'roulement', 'embrayage', 'pipe', 'carbu'),
	  allAirsalAlu:    calc(defs.all70airsalAlu, 'potVoca', 'roulement', 'embrayageMost', 'lamelleFibre', 'pipe', 'carbu24'),
	  allTopRose:      calc(defs.all75TopRose, 'potVoca', 'roulement', 'embrayageMost', 'clapetVl6', 'pipe', 'carbu24'),
	  all78Airsal:     calc(defs.all78Airsal, 'potVoca', 'roulement', 'embrayageMost', 'lamelleCarbonne', 'pipe', 'carbu24'),
	  all78brk:        calc(defs.all78brk, 'potMost80', 'embrayageMost', 'carbu24', 'mvtdd', 'roulementMost', 'admiItalkit'),
	  allTopalu:       calc(defs.allTopalu, 'carbu24'),
	  all78Most:       calc(defs.all78Most, 'carbu24', 'potMost80', 'embrayageMost', 'mvtdd', 'roulementMost', 'admiItalkit'),
	  
	  clearPot:        calc({ p: prices.nettoyant }),
	  
	  compet50Doppler: calc(defs.compet50Doppler, 'carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potMost70'),
	  compet50Mhr:     calc(defs.compet50Mhr, 'carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'potMost70'),
	  compet50Wr:      calc(defs.compet50Wr, 'carbu24', 'roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost'),
	  
	  compet70Fast:    calc(defs.compet70Fast, general70),
	  compet70Wr:      calc(defs.compet70Wr, general70),
	  compet70ProRace: calc(defs.compet70ProRace, general70),
	  compet78xtrem:   calc(defs.compet78xtrem, general70),
	  compet78mhr:     calc(defs.compet78mhr, general70),
	  compet78most:    calc(defs.compet78most, general70),
	  
	  compet80fast:    calc(defs.compet80fast, general80),
	  compet80wr:      calc(defs.compet80wr, general80),
	  
	  compet90wr:      calc(defs.compet90wr, general90),
	  compet90fast:    calc(defs.compet90fast, general90),
	  compet100fast:   calc(defs.compet100fast, general90),
	  compet96bida:    calc(defs.compet96bida, general90),
  
	  // Produits simples (directement mappés depuis l'objet prices pour éviter les fonctions inutiles)
	  mcAdelin:        prices.maitre,
	  progressif:      prices.cligno_progressif,
	  street:          prices.cligno_street,
	  greluma:         prices.cligno_greluma,
	  guidon:          prices.cligno_guidon,
	  autocollant:     prices.cligno_autocollant,
	  kitNettoyage:    prices.kitNettoyage,
	  vulcanet:        prices.vulcanet,
	  wd:              prices.wd,
	  wdSpray:         prices.wdSpray,
	  nettoyantFrein:  prices.nettoyantFrein,
	  motul800:        prices.motul800,
	  autosol:         prices.autosol,
	  chaine:          prices.chaine,
	  graisse:         prices.graisse,
	  huileBoite:      prices.huileBoite,
	  cuir:            prices.cuir,
	  bougie:          prices.bougie,
	  brosse:          prices.brosse,
	  wd40:            prices.wd40,
	  pige:            prices.pige,
	  alesage:         prices.alesage,
	  disque:          prices.disque,
	  pied:            prices.pied,
	  dynamo:          prices.dynamo,
	  burette:         prices.burette,
	  peteuse:         prices.peteuse,
	  caisse:          prices.caisse,
	  montageRoulement: prices.montageRoulement,
	  extracteur:      prices.extracteur,
	  branche3:        prices.branche3,
	  dayuan:          prices.dayuan,
	  inertie:         prices.inertie,
	  dremel:          prices.dremel,
	  renvoie:         prices.renvoie,
	  fraise:          prices.fraise,
	  k1:              prices.k1,
	  rabat:           prices.rabat,
	  full9:           prices.full9,
	  shark:           prices.shark,
	  poli:            prices.poli,
	  prettyle:        prices.prettyle,
	  exc:             prices.exc,
	  arriere:         prices.arriere,
	  barre:           prices.barre,
	  yngia:           prices.yngia,
	  horse:           prices.horse,
	  evomosa:         prices.evomosa,
	  jfg:             prices.jfg,
	  barreAlu:        prices.barreAlu,
	  vent:            prices.vent,
	  protec:          prices.protec,
	  embro:           prices.embro,
	  woostar:         prices.woostar,
	  universal:       prices.universal,
	  rcs:             prices.rcs,
	  clutch:          prices.clutch,
	  madbike:         prices.madbike,
	  support:         prices.support,
	  supportTel:      prices.supportTel,
	  appli:           prices.appli,
	  cagoule:         prices.cagoule,
	  antivol:         prices.antivol,
	  cardo:           prices.cardo,
	  gonfleur:        prices.gonfleur,
	  stand:           prices.stand,
	  vis:             prices.vis,
	  housse:          prices.housse,
	  calePied:        prices.calePied,
	  calePiedPro:     prices.calePiedPro,
	  leveMoto:        prices.leveMoto,
	  grille:          prices.grille,
	  elevateur:       prices.elevateur,
	  start:           prices.start,
	}
  ]