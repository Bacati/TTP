import { all70airsal, all70airsalAlu, all70top, all75TopRose, all78Airsal, all78brk, all78Most, allTopalu, compet50Doppler, compet50Mhr, compet50Wr, config, general } from 'libs/donner'
import { Coins, CreditCard, TrendingUp } from 'lucide-astro'

export const getCurrentConfig = (configType) => configurations[configType] || configurations["50doppler"];
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
  pvl: `Allumage pvl BIDALOT : ${general[0]?.pvl}`,
  vforce: `Boite à clapet vforce 3i 85cr : ${general[0]?.vforce}`,
  admiMost: `Pipe d'admission MOST : ${general[0]?.admiMost}`,
  potMost70: `Pot MOST 70-80 :  ${general[0]?.potMost70}`,
};

// Fonction pour créer les pièces spécifiques en combinant les pièces communes et spécifiques
const createSpecificPieces = (basePieces, specificPieces) => [
  ...basePieces,
  ...specificPieces.map(piece => commonGeneralPieces[piece] || piece),
];

// Fonction de création de configuration
const createConfig = (title, logo, alt, typeMotor, typeMotor1 = null, description, price, images, specificPieces) => ({
	title,
	logo,
	alt,
	enderTitle: "Compétition",
	typeMotor,
	typeMotor1,
	description,
	price,
	images: images.map(image => `${imagePrefix}/${image}`),
	pieces: specificPieces,
  });  


const configurations = {
  "50doppler": createConfig(
    "50cc Doppler vortex",
	`${imagePrefix}/mk.svg`,
    "Doppler vortex",
    "Derbi",
    "AM6",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Doppler,
    ["vortex.png", "vilojasilH.png","vforce.png", "carbu.png", "potmost70.png"],
    createSpecificPieces(
      [`Kit 50cc DOPPLER vortex : ${compet50Doppler[0]?.cylindre}`,
	  `Vilebrequin JASIL high tech : ${compet50Doppler[0]?.vilo}`,],
      ['roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'carbu28', 'potMost70']
    )
  ),
  "50mhr": createConfig(
    "50cc Malossi MHR team",
    `${imagePrefix}/malossi.png`,
    "50 malossi mhr team",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Mhr,
    ["50mhr.png", "vilojasilH.png","vforce.png", "carbu.png", "potmost70.png"],
    createSpecificPieces(
      [`Kit 50cc MALOSSI MHR team : ${compet50Mhr[0]?.cylindre}`,
	   `Vilebrequin JASIL EVO : ${compet50Mhr[0]?.vilo}`],
     ['roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'carbu28', 'potMost70']
    )
  ),
  "50bidalot": createConfig(
    "50cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "70 bidalot wr",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Wr,
    ["70bida.png", "vilobida.png", "vforce.png", "carbu.png", "potbida.png"],
    createSpecificPieces(
      [`Kit 50cc Bidalot WR : ${compet50Wr[0]?.cylindre}`,
	   `Vilebrequin BIDALOT course 39.7mm : ${compet50Wr[0]?.vilo}`,
		`Pot BIDALOT wr 50cc : ${compet50Wr[0]?.pot}`,
		],
	   ['roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'carbu28']
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



// Catégories de produits
export const categories = [
  {
    id: "50",
    label: "50",
    icon: Coins,
    products: [
    {
        title: "50cc Doppler vortex",
		logo: "mk.svg",
		alt: "50 doppler",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet50Doppler || 'N/A',
		image: "vortex.png",
		configKey: "50doppler" 
    },
    { 
		title: "50cc MHR team",
		logo: "malossi.png",
		alt: "50 mhr team",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet50Mhr || 'N/A',
		image: "50mhr.png",
		configKey: "50mhr" 
	},
    { 
		title: "70cc Bidalot WR",
		logo: "bida.png",
		alt: "50 bidalot wr",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet50Wr || 'N/A',
		image: "70bida.png",
		configKey: "50bidalot" 
	},
    ]
  },
  {
    id: "70",
    label: "70 à 79",
    icon: TrendingUp,
    products: [
      { title: "70cc Airsal Alu",
		logo: "airsal.png",
		description: "Configuration AllDays",
		price: config[0]?.allAirsalAlu || 'N/A',
		image: "70airsal.png",
		configKey: "70airsalAlu" },
      { title: "75cc Top performance",
		logo: "topPerf.png",
		description: "Configuration AllDays",
		price: config[0]?.allTopRose || 'N/A',
		image: "toprose.png",
		configKey: "75topRose" },
      { 
    title: "78cc Airsal alu",
    logo: "airsal.png",
		description: "Configuration AllDays",
		price: config[0]?.all78Airsal || 'N/A',
		image: "70airsal.png",
		configKey: "78airsal" },
    ]
  },
  {
    id: "80",
    label: "80 à 89",
    icon: CreditCard,
    products: [
      { 
        title: "78cc BRK 4RACE",
        logo: "brk.png",
        description: "Configuration AllDays",
        price: config[0]?.all78brk || 'N/A',
        image: "80brk.png",
        configKey: "78brk" 
      },
      { 
        title: "86cc Top performance",
        logo: "topPerf.png",
        description: "Configuration AllDays",
        price: config[0]?.allTopalu || 'N/A',
        image: "topalu.png",
        configKey: "86top" 
      },
      {
        title: "78cc MOST 4STREET",
        logo: "most.png",
        description: "Configuration AllDays",
        price: config[0]?.all78Most || 'N/A',
        image: "80most.png",
        configKey: "78most" 
      },
    ]
  },
  {
    id: "90",
    label: "90 à 99",
    icon: CreditCard,
    products: [
      { 
        title: "78cc BRK 4RACE",
        logo: "brk.png",
        description: "Configuration AllDays",
        price: config[0]?.all78brk || 'N/A',
        image: "80brk.png",
        configKey: "78brk" 
      },
      { 
        title: "86cc Top performance",
        logo: "topPerf.png",
        description: "Configuration AllDays",
        price: config[0]?.allTopalu || 'N/A',
        image: "topalu.png",
        configKey: "86top" 
      },
      {
        title: "78cc MOST 4STREET",
        logo: "most.png",
        description: "Configuration AllDays",
        price: config[0]?.all78Most || 'N/A',
        image: "80most.png",
        configKey: "78most" 
      },
    ]
  },
  {
    id: "100",
    label: "100",
    icon: CreditCard,
    products: [
      { 
        title: "78cc BRK 4RACE",
        logo: "brk.png",
        description: "Configuration AllDays",
        price: config[0]?.all78brk || 'N/A',
        image: "80brk.png",
        configKey: "78brk" 
      },
      { 
        title: "86cc Top performance",
        logo: "topPerf.png",
        description: "Configuration AllDays",
        price: config[0]?.allTopalu || 'N/A',
        image: "topalu.png",
        configKey: "86top" 
      },
      {
        title: "78cc MOST 4STREET",
        logo: "most.png",
        description: "Configuration AllDays",
        price: config[0]?.all78Most || 'N/A',
        image: "80most.png",
        configKey: "78most" 
      },
    ]
  }
];
