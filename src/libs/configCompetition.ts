import { compet50Doppler, compet50Mhr, compet50Wr, compet70Fast, compet70ProRace, compet70Wr, compet78mhr, compet78most, compet78xtrem, compet80fast, compet80wr, compet90fast, compet90wr, config, general } from 'libs/donner'

export const getCurrentConfigCompet = (configTypeCompet) => configurations[configTypeCompet] || configurations["50doppler"];
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
  carbu32: `Carburateur 32MM SUNWORLD : ${general[0]?.carbu32}`,
  carbu34: `Carburateur 34MM SUNWORLD : ${general[0]?.carbu32}`,
  potMost: `Pot MOST 50-70 : ${general[0]?.pot}`,
  potVoca: `Pot VOCA 70-80 : ${general[0]?.potVoca}`,
  lamelleFibre: `Lamelle fibre DOPPLER ER2 : ${general[0]?.lamelleFibre}`,
  clapetVl6: `Boite à clapets MALOSSI VL6 : ${general[0]?.clapetVl6}`,
  lamelleCarbonne: `Lamelle carbon DOPPLER ER3 derbi : ${general[0]?.lamelleCarbonne}`,
  potMost80: `Pot MOST 80-90 : ${general[0]?.potMost80}`,
  mvtdd: `Allumage MVT Digital Direct : ${general[0]?.mvtdd}`,
  roulementMost: `Roulement et spy MOST : ${general[0]?.roulementMost}`,
  admiItal: `Admission ITALKIT : ${general[0]?.admiItalkit}`,
  pvl: `Allumage pvl BIDALOT : ${general[0]?.pvl}`,
  vforce: `Boite à clapet vforce 3i 85cr : ${general[0]?.vforce}`,
  admiMost: `Pipe d'admission MOST : ${general[0]?.admiMost}`,
  potMost70: `Pot MOST 70-80 :  ${general[0]?.potMost70}`,
  potTxt80: `Pot TXT :  ${general[0]?.potTxtV8}`,
  potTxtV8: `Pot TXT V8 :  ${general[0]?.potTxtV8}`,
  potTxtV21: `Pot TXT V21 : ${general[0]?.potTxtV21}`,
  viloItal: `Vilebrequin ITALKIT compétion : ${general[0]?.viloItal}`,
  viloItal44: `Vilebrequin ITALKIT course 44,9 : ${general[0]?.viloItal44}`,
};

// Fonction pour créer les pièces spécifiques en combinant les pièces communes et spécifiques
const createSpecificPieces = (basePieces, specificPieces) => [
  ...basePieces,
  ...specificPieces.map(piece => commonGeneralPieces[piece] || piece || grosseConfig),
];

const grosseConfig70 = [
  'viloItal',
  'roulementMost', 
  'pvl', 
  'embrayageMost', 
  'vforce', 
  'admiMost', 
  'carbu32', 
  'potTxt80'
];
const grosseConfig80 = [
  'viloItal',
  'roulementMost', 
  'pvl', 
  'embrayageMost', 
  'vforce', 
  'admiMost', 
  'carbu34', 
  'potTxtV8'
];
const grosseConfig80Course = [
  'viloItal44',
  'roulementMost', 
  'pvl', 
  'embrayageMost', 
  'vforce', 
  'admiMost', 
  'carbu34', 
  'potTxtV8'
];
const grosseConfig90Course = [
	'viloItal44',
	'roulementMost', 
	'pvl', 
	'embrayageMost', 
	'vforce', 
	'admiMost', 
	'carbu34', 
	'potTxtV21'
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
	`${imagePrefix}/doppler.png`,
    "Doppler vortex",
    "Derbi",
    "AM6",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Doppler,
    ["vortex.png", "vilojasilH.png", "pvl.png", "vforce.png", "carbu.png", "potmost70.png"],
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
    ["50mhr.png", "vilojasilH.png", "pvl.png", "vforce.png", "carbu.png", "potmost70.png"],
    createSpecificPieces(
      [`Kit 50cc MALOSSI MHR team : ${compet50Mhr[0]?.cylindre}`,
	   `Vilebrequin JASIL EVO : ${compet50Mhr[0]?.vilo}`],
     ['roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'carbu28', 'potMost70']
    )
  ),
  "50bidalot": createConfig(
    "50cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "50 bidalot wr",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Wr,
    ["70bida.png", "vilobida.png", "pvl.png", "vforce.png", "carbu.png", "potbida.png"],
    createSpecificPieces(
      [`Kit 50cc Bidalot WR : ${compet50Wr[0]?.cylindre}`,
	   `Vilebrequin BIDALOT course 39.7mm : ${compet50Wr[0]?.vilo}`,
		`Pot BIDALOT wr 50cc : ${compet50Wr[0]?.pot}`,
		],
	   ['roulementMost', 'pvl', 'embrayageMost', 'vforce', 'admiMost', 'carbu28']
    )
  ),
  "70fast": createConfig(
    "70cc 2Fast",
    `${imagePrefix}/fast.png`,
    "70 fast",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet70Fast,
    ["fastCyl.png", "viloitalikit.png", "pvl.png", "vforce.png", "carbu.png", "txt80.png"],
    createSpecificPieces(
      [`70cc 2Fast : ${compet70Fast[0]?.cylindre}`],
      grosseConfig70
    )
  ),
  "70wr": createConfig(
    "70cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "70 wr",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet70Wr,
    ["70bida.png", "viloitalikit.png", "pvl.png", "vforce.png", "carbu.png", "txt80.png"],
    createSpecificPieces(
      [`70cc Bidalot WR : ${compet70Wr[0]?.cylindre}`],
      grosseConfig70
    )
  ),
  "70prorace": createConfig(
    "70cc Metrakit pro race",
    `${imagePrefix}/mk.svg`,
    "70 pro race",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet70ProRace,
    ["prorace.png", "viloitalikit.png", "pvl.png", "vforce.png", "carbu.png", "txt80.png"],
    createSpecificPieces(
      [`70cc Metrakit pro race : ${compet70ProRace[0]?.cylindre}`],
      grosseConfig70
    )
  ),
  "78xtrem": createConfig(
    "78cc Airsal xtrem",
    `${imagePrefix}/airsal.png`,
    "80 airsal xtrem",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet78xtrem,
    ["airsalxtrem.png", "viloitalikit.png", "pvl.png", "vforce.png", "carbu.png", "txt.png"],
    createSpecificPieces(
      [`78cc Airsal xtrem : ${compet78xtrem[0]?.cylindre}`],
      grosseConfig80
    )
  ),
  "78mhr": createConfig(
    "78cc Malossi MHR Team",
    `${imagePrefix}/malossi.png`,
    "80 MHR team",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet78mhr,
    ["50mhr.png", "viloitalikit.png", "pvl.png", "vforce.png", "carbu.png", "txt.png"],
    createSpecificPieces(
      [`78cc Malossi MHR Team : ${compet78mhr[0]?.cylindre}`],
      grosseConfig80
    )
  ),
  "78most": createConfig(
    "78cc MOST 4STREET",
    `${imagePrefix}/most.png`,
    "80 most",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet78most,
    ["80most.png", "viloitalikit.png", "pvl.png", "vforce.png", "carbu.png", "txt.png"],
    createSpecificPieces(
      [`Kit cylindre 78cc MOST 4street : ${compet78most[0]?.cylindre}`],
      grosseConfig80
    )
  ),
  "80fast": createConfig(
    "80cc 2Fast",
    `${imagePrefix}/fast.png`,
    "80 fast",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet80fast,
    ["fastCyl.png", "viloita44.png", "pvl.png", "vforce.png", "carbu.png", "txt.png"],
    createSpecificPieces(
      [`Kit cylindre 80cc 2Fast : ${compet80fast[0]?.cylindre}`],
      grosseConfig80Course
    )
  ),
  "80wr": createConfig(
    "80cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "80 wr",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet80wr,
    ["70bida.png", "viloita44.png", "pvl.png", "vforce.png", "carbu.png", "txt.png"],
    createSpecificPieces(
      [`Kit cylindre 80cc Bidalot WR : ${compet80wr[0]?.cylindre}`],
      grosseConfig80Course
    )
  ),
  "90wr": createConfig(
    "90cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "90 wr",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet90wr,
    ["70bida.png", "viloita44.png", "pvl.png", "vforce.png", "carbu.png", "v21.png"],
    createSpecificPieces(
      [`Kit cylindre 90cc Bidalot WR : ${compet90wr[0]?.cylindre}`],
      grosseConfig90Course
    )
  ),
  "90fast": createConfig(
    "90cc 2Fast",
    `${imagePrefix}/fast.png`,
    "90 fast",
    "AM6",
    "Derbi",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet90fast,
    ["fastCyl.png", "viloita44.png", "pvl.png", "vforce.png", "carbu.png", "v21.png"],
    createSpecificPieces(
      [`Kit cylindre 90cc Bidalot WR : ${compet90fast[0]?.cylindre}`],
      grosseConfig90Course
    )
  ),
};



// Catégories de produits
export const categories = [
  {
    id: "50",
    label: "50",
    products: [
    {
        title: "50cc Doppler vortex",
		logo: "doppler.png",
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
		title: "50cc Bidalot WR",
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
    label: "70",
    products: [
      {
		title: "70cc 2Fast",
		logo: "fast.png",
		alt: "70 2Fast",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet70Fast || 'N/A',
		image: "fastCyl.png",
		configKey: "70fast" 
	},
    { 
		title: "70cc Bidalot WR",
		logo: "bida.png",
		alt: "70 2Fast",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet70Wr || 'N/A',
		image: "70bida.png",
		configKey: "70wr"
	},
    { 
		title: "70cc Metrakit pro race",
		logo: "mk.svg",
		alt: "70 pro race",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet70ProRace || 'N/A',
		image: "prorace.png",
		configKey: "70prorace"
	},
    ]
  },
  {
    id: "80",
    label: "80",
    products: [
      { 
        title: "78cc Airsal xtrem",
		logo: "airsal.png",
		alt: "80 airsal xtrem",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet78xtrem|| 'N/A',
		image: "airsalxtrem.png",
		configKey: "78xtrem"
      },
      { 
        title: "78cc MHR Team",
		logo: "malossi.png",
		alt: "80 mhr team",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet78mhr|| 'N/A',
		image: "50mhr.png",
		configKey: "78mhr"
      },
      {
        title: "78cc MOST 4STREET",
        logo: "most.png",
		alt: "80 mhr team",
        description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
        price: config[0]?.compet78most || 'N/A',
        image: "80most.png",
        configKey: "78most" 
      },
	  {
      	title: "80cc 2Fast",
		logo: "fast.png",
		alt: "80 2Fast",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet80fast || 'N/A',
		image: "fastCyl.png",
		configKey: "80fast" 
	  },
	{
		title: "80cc Bidalot WR",
		logo: "bida.png",
		alt: "80 wr",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet80wr || 'N/A',
		image: "70bida.png",
		configKey: "80wr" 
	},
    ]
  },
  {
    id: "90",
    label: "90",
    products: [
		{
			title: "90cc Bidalot WR",
			logo: "bida.png",
			alt: "90 wr",
			description: "Compétition",
			typeMotor1: "Derbi",
			typeMotor: "AM6",
			price: config[0]?.compet90wr || 'N/A',
			image: "90bida.png",
			configKey: "90wr" 
		},
		{
			title: "90cc 2Fast",
			logo: "fast.png",
			alt: "90 fast",
			description: "Compétition",
			typeMotor1: "Derbi",
			typeMotor: "AM6",
			price: config[0]?.compet90fast || 'N/A',
			image: "fastCyl.png",
			configKey: "90fast" 
		},
    ]
  },
  {
    id: "100",
    label: "100",
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
