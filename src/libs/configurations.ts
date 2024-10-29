import { all50Mk, all70airsal, all70airsalAlu, all70top, all75TopRose, all78Airsal, all78brk, all78Most, allTopalu, config, general } from 'libs/donner'
// Fonction pour récupérer la configuration courante
export const getCurrentConfig = (configType) => configurations[configType] || configurations["50mk"];

const imagePrefix = "/images";

const commonGeneralPieces = {
  roulement: `Roulement et spy WATTS : ${general[0]?.roulement}`,
  embrayage: `Embrayage MALOSSI : ${general[0]?.embrayage}`,
  embrayageMost: `Embrayage MOST : ${general[0]?.embrayageMost}`,
  pipe: `Pipe d'admission WATTS type cr : ${general[0]?.pipe}`,
  carbu21: `Carburateur 21MM SUNWORLD : ${general[0]?.carbu}`,
  carbu24: `Carburateur 24MM SUNWORLD : ${general[0]?.carbu24}`,
  carbu26: `Carburateur 26MM SUNWORLD : ${general[0]?.carbu24}`,
  carbu28: `Carburateur 28MM SUNWORLD : ${general[0]?.carbu24}`,
  potMost: `Pot MOST 50-70 : ${general[0]?.pot}`,
  potVoca: `Pot VOCA 70-80 : ${general[0]?.potVoca}`,
  lamelleFibre: `Lamelle fibre DOPPLER ER2 : ${general[0]?.lamelleFibre}`,
  clapetVl6: `Boite à clapets MALOSSI VL6 : ${general[0]?.clapetVl6}`,
  lamelleCarbonne: `Lamelle carbon DOPPLER ER3 derbi : ${general[0]?.lamelleCarbonne}`,
  potMost80: `Pot MOST 80-90 : ${general[0]?.potMost80}`,
  mvtdd: `Allumage MVT Digital Direct : ${general[0]?.mvtdd}`,
  roulementMost: `Roulement et spy MOST : ${general[0]?.roulement}`,
  admiItal: `Admission ITALKIT : ${general[0]?.admiItalkit}`,
};

// Fonction pour créer les pièces spécifiques en combinant les pièces communes et spécifiques
const createSpecificPieces = (basePieces, specificPieces) => [
  ...basePieces,
  ...specificPieces.map(piece => commonGeneralPieces[piece] || piece),
];

// Fonction de création de configuration
const createConfig = (title: string, logo: string, alt: string, typeMotor, typeMotor1 = null, description: string | null, price: string | number, images, specificPieces) => ({
  title,
  logo,
  alt,
  enderTitle: "Configuration AllDays",
  typeMotor,
  typeMotor1,
  description,
  price,
  images: images.map(image => `${imagePrefix}/${image}`),
  pieces: specificPieces,
});

// Configurations détaillées
const configurations = {
  "50mk": createConfig(
    "50cc Metrakit Alu",
    `${imagePrefix}/mk.svg`,
    "Metrakit",
    "Derbi",
    "AM6",
    "Une configuration robuste. Pas très performante, mais capable de parcourir de nombreux kilomètres sans souci.",
    config[0]?.allMk,
    ["50mk.png", "carbupolini.png", "potmost50.png"],
    createSpecificPieces(
      [`Kit 50cc METRAKIT ALU : ${all50Mk[0]?.cylindre}`,
	  `Carburateur 17,5MM POLINI : ${all50Mk[0]?.carbu}`,],
      ['potMost']
    )
  ),
  "70top": createConfig(
    "70cc Top Performance noir",
    `${imagePrefix}/top.webp`,
    "70 top noir",
    "AM6",
    null,
    "Configuration commune, solide et adaptée pour de longues distances.",
    config[0]?.allTop,
    ["topnoir.png", "vilojasilv.png", "carbu.png", "potmost50.png"],
    createSpecificPieces(
      [`Kit TOP Performance noir 70cc : ${all70top[0]?.cylindre}`,
	   `Vilebrequin JASIL EVO : ${all70top[0]?.vilo}`],
      ['roulement', 'embrayage', 'pipe', 'carbu21', 'potMost']
    )
  ),
  "70airsal": createConfig(
    "70cc Airsal fonte",
    `${imagePrefix}/airsal.png`,
    "70 airsal",
    "AM6",
    "Derbi",
    "Configuration très robuste avec de bonnes performances pour débuter.",
    config[0]?.allAirsal,
    ["70airsalfonte.png", "vilowatts.png", "carbu.png", "potmost50.png"],
    createSpecificPieces(
      [`Kit 70cc AIRSAL fonte : ${all70airsal[0]?.cylindre}`,
	   `Vilebrequin WATTS : ${all70airsal[0]?.vilo}`],
      ['roulement', 'embrayage', 'pipe', 'carbu21', 'potMost']
    )
  ),
  "70airsalAlu": createConfig(
    "70cc Airsal Alu",
    `${imagePrefix}/airsal.png`,
    "70 airsal",
    "AM6",
    "Derbi",
    "Cylindre très solide, bien respecter les temps de chauffe.",
    config[0]?.allAirsalAlu,
    ["70airsal.png", "artekk2.png", "carbu.png", "potvoca.png"],
    createSpecificPieces(
      [`70cc AIRSAL ALU : ${all70airsalAlu[0]?.cylindre}`,
	  `Vilebrequin ARTEK K2 : ${all70airsalAlu[0]?.vilo}`],
      ['roulement', 'embrayageMost', 'lamelleFibre', 'pipe', 'carbu24', 'potVoca']
    )
  ),
  "75topRose": createConfig(
    "75cc Top performance rose",
    `${imagePrefix}/top.webp`,
    "75 top rose",
    "AM6",
    null,
    "Configuration solide pour de nombreux kilomètres avec performance.",
    config[0]?.allTopRose,
    ["toprose.png", "vilojasilH.png", "carbu.png", "potvoca.png"],
    createSpecificPieces(
      [`Kit cylindre 75cc Top performance rose : ${all75TopRose[0]?.cylindre}`,
	  `Vilebrequin Jasil high tech : ${all75TopRose[0]?.vilo}`],
      ['roulement', 'embrayageMost', 'clapetVl6', 'pipe', 'carbu26', 'potVoca']
    )
  ),
  "78airsal": createConfig(
    "78cc Airsal alu tech",
    `${imagePrefix}/airsal.png`,
    "80 airsal",
    "Derbi",
    null,
    "Configuration très basique avec un cylindre robuste. Il est essentiel de respecter le temps de chauffe. Le cylindre offre un bon couple, idéal pour une utilisation quotidienne tout en procurant du plaisir de conduite.",
    config[0]?.all78Airsal,
    ["70airsal.png", "vilojasilH.png", "carbu.png", "potvoca.png"],
    createSpecificPieces(
      [`Kit cylindre 78cc Airsal alu tech : ${all78Airsal[0]?.cylindre}`,
	  `Vilebrequin Jasil high tech : ${all78Airsal[0]?.vilo}`],
      ['roulement', 'embrayageMost', 'lamelleCarbonne', 'pipe', 'carbu28', 'potVoca']
    )
  ),
  "78brk": createConfig(
    "78cc BRK 4RACE",
    `${imagePrefix}/brk.png`,
    "78 brk",
    "AM6",
    "Derbi",
    "Configuration légèrement plus avancée, avec un cylindre à la fois solide et performant. Il est crucial de bien respecter le temps de chauffe. Le cylindre offre un bon couple et un bon regime, ce qui le rend idéal pour une utilisation quotidienne tout en offrant un réel plaisir de conduite.",
    config[0]?.all78brk,
    ["80brk.png", "vilomost.png", "admiita.png","carbu.png", "potmost.png"],
    createSpecificPieces(
      [`Kit cylindre 78cc BRK 4RACE : ${all78brk[0]?.cylindre}`,
	  `Vilebrequin MOST evo 2h : ${all78brk[0]?.vilo}`,
      ],
      ['embrayageMost', 'carbu28', 'potMost80', 'mvtdd', 'roulementMost', 'admiItal']
    )
  ),
  "86top": createConfig(
    "86cc Top performance",
    `${imagePrefix}/top.webp`,
    "86 top alu",
    "AM6",
    null,
    "Configuration basique avec un cylindre particulièrement solide. Il est essentiel de bien respecter les temps de chauffe. Lors du montage, il est important d'appliquer une fine couche de pâte à joint au niveau du joint d'embase pour éviter d'endommager le piston. Le moteur, très coupleux, est non seulement agréable à conduire au quotidien, mais aussi très réactif et ludique.",
    config[0]?.allTopalu,
    ["topalu.png", "baatop.png","carbu.png", "ardv2.png"],
    createSpecificPieces(
      [`Pack moteur 86cc TOP performance alu : ${allTopalu[0]?.pack}`,
	  `Embrayage NEWFREN : ${allTopalu[0]?.embrayage}`,
    `Boite à clapet TOP performance : ${allTopalu[0]?.bacTop}`,
    `Pipe d'admission MOST : ${allTopalu[0]?.pipeMost}`,
    `Pot 2WIN ARD V2 : ${allTopalu[0]?.pot2win}`,
      ],
      ['carbu28']
    )
  ),
  "78most": createConfig(
    "78cc MOST 4STREET",
    `${imagePrefix}/most.png`,
    "80 most",
    "AM6",
    "Derbi",
    "Configuration légèrement plus avancée, avec un cylindre à la fois solide et performant. Il est crucial de bien respecter le temps de chauffe. Le cylindre offre un bon couple et monte bien dans les tours, ce qui le rend idéal pour une utilisation quotidienne tout en offrant un réel plaisir de conduite.",
    config[0]?.all78Most,
    ["80most.png", "viloairsal.png", "admiita.png","carbu.png", "potmost.png"],
    createSpecificPieces(
      [`Kit cylindre 78cc MOST 4street : ${all78Most[0]?.cylindre}`,
	  `Vilebrequin AIRSAL : ${all78Most[0]?.vilo}`,
      ],
      ['embrayageMost', 'carbu28', 'potMost80', 'mvtdd', 'roulementMost', 'admiItal']
    )
  ),
};
const desc = "Configuration AllDays"

// Catégories de produits
export const categories = [
  {
    id: "500",
    label: "500€ à 700€",
    source: `${imagePrefix}/simple.svg`,
    products: [
      { 
		title: "50cc Metrakit Alu",
		logo: "mk.svg",
		alt: "50 mk",
		description: desc,
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.allMk || 'N/A',
		image: "50mk.png",
		configKey: "50mk" 
      },
      { 
		title: "70cc Top Performance",
		logo: "top.webp",
		alt: "70 top",
		description: desc,
    typeMotor: "AM6",
		price: config[0]?.allTop || 'N/A',
		image: "topnoir.png",
		configKey: "70top" 
	},
      { 
		title: "70cc Airsal fonte",
		logo: "airsal.png",
		alt: "70 airsal",
		description: desc,
		typeMotor: "AM6",
		typeMotor1: "Derbi",
		price: config[0]?.allAirsal || 'N/A',
		image: "70airsalfonte.png",
		configKey: "70airsal" 
	},
    ]
  },
  {
    id: "700",
    label: "700€ à 1000€",
    source: `${imagePrefix}/double.svg`,
    products: [
    { 
		title: "70cc Airsal Alu",
		logo: "airsal.png",
		alt: "70 airsal",
		description: desc,
		typeMotor: "AM6",
		typeMotor1: "Derbi",
		price: config[0]?.allAirsalAlu || 'N/A',
		image: "70airsal.png",
		configKey: "70airsalAlu" 
	},
    {
		title: "75cc Top performance",
		logo: "top.webp",
		alt: "75 top rose",
		description: desc,
    	typeMotor: "AM6",
		price: config[0]?.allTopRose || 'N/A',
		image: "toprose.png",
		configKey: "75topRose" 
	},
    { 
		title: "78cc Airsal alu",
		logo: "airsal.png",
		alt: "80 airsal",
		description: desc,
		typeMotor: "Derbi",
		price: config[0]?.all78Airsal || 'N/A',
		image: "70airsal.png",
		configKey: "78airsal" 
	},
    ]
  },
  {
    id: "1000",
    label: "1000€ à 1500€",
    source: `${imagePrefix}/triple.svg`,
    products: [
      { 
        title: "78cc BRK 4RACE",
        logo: "brk.png",
		alt: "80 barikit",
        description: desc,
        typeMotor: "AM6",
        typeMotor1: "Derbi",
        price: config[0]?.all78brk || 'N/A',
        image: "80brk.png",
        configKey: "78brk" 
      },
      { 
        title: "86cc Top performance",
        logo: "top.webp",
		alt: "top alu",
        description: desc,
        typeMotor: "AM6",
        price: config[0]?.allTopalu || 'N/A',
        image: "topalu.png",
        configKey: "86top" 
      },
      {
        title: "78cc MOST 4STREET",
        logo: "most.png",
		alt: "80 most",
        description: desc,
        typeMotor: "AM6",
        typeMotor1: "Derbi",
        price: config[0]?.all78Most || 'N/A',
        image: "80most.png",
        configKey: "78most" 
      },
    ]
  }
];
