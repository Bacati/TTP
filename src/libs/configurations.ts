import { all50Mk, all70airsal, all70airsalAlu, all70top, all75TopRose, config, general } from 'libs/donner'
import { Coins, CreditCard, TrendingUp } from 'lucide-astro'

const imagePrefix = "/images";
const linkPrefix = "/product/config?config=";

const commonGeneralPieces = {
  roulement: `Roulement et spy WATTS : ${general[0].roulement}`,
  embrayage: `Embrayage MALOSSI : ${general[0].embrayage}`,
  embrayageMost: `Embrayage MOST : ${general[0]?.embrayageMost}`,
  pipe: `Pipe d'admission WATTS type cr : ${general[0].pipe}`,
  carbu21: `Carburateur 21MM SUNWORLD : ${general[0].carbu}`,
  carbu24: `Carburateur 24MM SUNWORLD : ${general[0].carbu24}`,
  carbu26: `Carburateur 26MM SUNWORLD : ${general[0].carbu24}`,
  potMost: `Pot MOST 50-70 : ${general[0].pot}`,
  potVoca: `Pot VOCA 70-80 : ${general[0].potVoca}`,
  lamelleFibre: `Lamelle fibre DOPPLER ER2 : ${general[0].lamelleFibre}`,
};

// Fonction pour créer les pièces spécifiques en combinant les pièces communes et spécifiques
const createSpecificPieces = (basePieces, specificPieces) => [
  ...basePieces,
  ...specificPieces.map(piece => commonGeneralPieces[piece] || piece),
];

// Fonction de création de configuration
const createConfig = (title, description, price, images, specificPieces) => ({
  title,
  enderTitle: "Configuration AllDays",
  description,
  price,
  images: images.map(image => `${imagePrefix}/${image}`),
  pieces: specificPieces,
});

// Configurations détaillées
const configurations = {
  "50mk": createConfig(
    "50 Metrakit Alu",
    "Configuration très solide. Peu performant mais permet de faire de nombreux kilomètres sans problème.",
    config[0].allMk,
    ["50mk.png", "carbupolini.png", "potmost50.png"],
    createSpecificPieces(
      [`Kit 50cc METRAKIT ALU : ${all50Mk[0].cylindre}`,
	  `Carburateur 17,5MM POLINI : ${all50Mk[0].carbu}`,],
      ['potMost']
    )
  ),
  "70top": createConfig(
    "70 Top Performance noir",
    "Configuration commune, solide et adaptée pour de longues distances.",
    config[0].allTop,
    ["topnoir.png", "vilojasilv.png", "carbu.png", "potmost50.png"],
    createSpecificPieces(
      [`Kit TOP Performance noir 70cc : ${all70top[0].cylindre}`,
	   `Vilebrequin JASIL EVO : ${all70top[0].vilo}`],
      ['roulement', 'embrayage', 'pipe', 'carbu21', 'potMost']
    )
  ),
  "70airsal": createConfig(
    "70 Airsal fonte",
    "Configuration très robuste avec de bonnes performances pour débuter.",
    config[0].allAirsal,
    ["70airsalfonte.png", "vilowatts.png", "carbu.png", "potmost50.png"],
    createSpecificPieces(
      [`Kit 70cc AIRSAL fonte : ${all70airsal[0].cylindre}`,
	   `Vilebrequin WATTS : ${all70airsal[0].vilo}`],
      ['roulement', 'embrayage', 'pipe', 'carbu21', 'potMost']
    )
  ),
  "70airsalAlu": createConfig(
    "70 Airsal Alu",
    "Cylindre très solide, bien respecter les temps de chauffe.",
    config[0].allAirsalAlu,
    ["70airsal.png", "artekk2.png", "carbu.png", "potvoca.png"],
    createSpecificPieces(
      [`70cc AIRSAL ALU : ${all70airsalAlu[0].cylindre}`,
	  `Vilebrequin ARTEK K2 : ${all70airsalAlu[0].vilo}`],
      ['roulement', 'embrayageMost', 'lamelleFibre', 'pipe', 'carbu24', 'potVoca']
    )
  ),
  "75topRose": createConfig(
    "75cc Top performance rose",
    "Configuration solide pour de nombreux kilomètres avec performance.",
    config[0].allTopRose,
    ["toprose.png", "vilojasil.png", "carbu.png", "potvoca.png"],
    createSpecificPieces(
      [`Kit cylindre 75cc Top performance rose : ${all75TopRose[0].cylindre}`,
	  `Vilebrequin Jasil high tech : ${all75TopRose[0].vilo}`],
      ['roulement', 'embrayageMost', 'lamelleFibre', 'pipe', 'carbu26', 'potVoca']
    )
  ),
};

// Fonction pour récupérer la configuration courante
export const getCurrentConfig = (configType) => configurations[configType] || configurations["50mk"];

// Fonction pour générer des données produits à partir de `config`
export const generateProductData = (config) => [
  {
    title: "50 Metrakit Alu",
    logo: "mk.svg",
    description: "Configuration AllDays",
    price: config[0].allMk || 'N/A',
    imageSrc: `${imagePrefix}/50mk.png`,
    link: `${linkPrefix}50mk`
  },
  {
    title: "70 Top Performance noir",
    logo: "topPerf.png",
    description: "Configuration AllDays",
    price: config[0].allTop || 'N/A',
    imageSrc: `${imagePrefix}/topnoir.png`,
    link: `${linkPrefix}70top`
  },
  {
    title: "70 Airsal fonte",
    logo: "airsal.png",
    description: "Configuration AllDays",
    price: config[0].allAirsal || 'N/A',
    imageSrc: `${imagePrefix}/70airsalfonte.png`,
    link: `${linkPrefix}70airsal`
  },
  {
    title: "70 Airsal Alu",
    logo: "airsal.png",
    description: "Configuration AllDays",
    price: config[0].allAirsalAlu || 'N/A',
    imageSrc: `${imagePrefix}/70airsal.png`,
    link: `${linkPrefix}70airsalAlu`
  },
  {
    title: "75cc Top performance rose",
    logo: "topPerf.png",
    description: "Configuration AllDays",
    price: config[0].allTopRose || 'N/A',
    imageSrc: `${imagePrefix}/toprose.png`,
    link: `${linkPrefix}75topRose`
  },
];

// Produits rapides spécifiques (par exemple, pour un slider)
export const fastProducts = [
  { title: "Kit cylindre 2Fast",
	description: "Grosse config",
	price: "996",
	imageSrc: `${imagePrefix}/cylindre2fast.png`,
	link: `${linkPrefix}2fast` },
  { title: "Kit cylindre 2Fast",
	description: "Grosse config",
	price: "1200",
	imageSrc: `${imagePrefix}/cylindre2fast.png`,
	link: `${linkPrefix}2fast1` },
  { title: "Kit cylindre 2Fast",
	description: "Grosse config",
	price: "1500",
	imageSrc: `${imagePrefix}/cylindre2fast.png`,
  	link: `${linkPrefix}2fast2` },
];

// Catégories de produits
export const categories = [
  {
    id: "500",
    label: "500€ à 700€",
    icon: Coins,
    products: [
      { title: "50 Metrakit Alu",
		logo: "mk.svg",
		description: "Configuration AllDays",
		price: config[0].allMk || 'N/A',
		image: "50mk.png",
		configKey: "50mk" },
      { title: "70 Top Performance noir",
		logo: "topPerf.png",
		description: "Configuration AllDays",
		price: config[0].allTop || 'N/A',
		image: "topnoir.png",
		configKey: "70top" },
      { title: "70 Airsal fonte",
		logo: "airsal.png",
		description: "Configuration AllDays",
		price: config[0].allAirsal || 'N/A',
		image: "70airsalfonte.png",
		configKey: "70airsal" },
    ]
  },
  {
    id: "700",
    label: "700€ à 1000€",
    icon: TrendingUp,
    products: [
      { title: "70 Airsal Alu",
		logo: "airsal.png",
		description: "Configuration AllDays",
		price: config[0].allAirsalAlu || 'N/A',
		image: "70airsal.png",
		configKey: "70airsalAlu" },
      { title: "75cc Top performance rose",
		logo: "topPerf.png",
		description: "Configuration AllDays",
		price: config[0].allTopRose || 'N/A',
		image: "toprose.png",
		configKey: "75topRose" },
      { title: "Kit cylindre 2Fast",
		description: "Grosse config",
		price: "996",
		image: "cylindre2fast.png",
		configKey: "2fast" },
    ]
  },
  {
    id: "1000",
    label: "1000€ à 1500€",
    icon: CreditCard,
    products: [
      { title: "Kit cylindre 2Fast", description: "Grosse config", price: "1000", image: "cylindre2fast.png", configKey: "2fast1" },
      { title: "Kit cylindre 2Fast", description: "Grosse config", price: "1200", image: "cylindre2fast.png", configKey: "2fast2" },
      { title: "Kit cylindre 2Fast", description: "Grosse config", price: "1500", image: "cylindre2fast.png", configKey: "2fast3" },
    ]
  }
];
