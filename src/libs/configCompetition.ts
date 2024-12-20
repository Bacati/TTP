import { compet100fast, compet50Doppler, compet50Mhr, compet50Wr, compet70Fast, compet70ProRace, compet70Wr, compet78mhr, compet78most, compet78xtrem, compet80fast, compet80wr, compet90fast, compet90wr, compet96bida, config, general } from 'libs/donner'

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
  carbu36: `Carburateur 36MM SUNWORLD : ${general[0]?.carbu32}`,
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
const imageConfig = [
  "viloita44.png", "pvl.png", "vforce.png", "carbu.png"
]
const imageConfig70 = [
  "viloitalikit.png", "pvl.png", "vforce.png", "carbu.png"
]
const imageConfig50 = [
  "vilojasilH.png", "pvl.png", "vforce.png", "carbu.png"
]
const imageConfig100 = [
	"pvl.png", "vforce.png", "carbu.png", "v21.png"
  ]
const grosseConfig50 = [
  'roulementMost', 
  'pvl',
  'embrayageMost', 
  'vforce', 
  'admiMost', 
  'carbu28'
]
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
  const grosseConfig100Course = [
	'roulementMost', 
	'pvl', 
	'embrayageMost', 
	'vforce', 
	'admiMost', 
	'carbu36', 
	'potTxtV21'
  ];

// Fonction de création de configuration
const createConfig = (title, logo, alt, description, price, images, specificPieces) => ({
	title,
	logo,
	alt,
	enderTitle: "Compétition",
	typeMotor: "AM6",
	typeMotor1: "Derbi",
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
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Doppler,
    ["vortex.png", ...imageConfig50, "potmost70.png"],
    createSpecificPieces(
      [`Kit 50cc DOPPLER vortex : ${compet50Doppler[0]?.cylindre}`,
	  `Vilebrequin JASIL high tech : ${compet50Doppler[0]?.vilo}`,],
      [...grosseConfig50, 'potMost70']
    )
  ),
  "50mhr": createConfig(
    "50cc Malossi MHR team",
    `${imagePrefix}/malossi.png`,
    "50 malossi mhr team",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Mhr,
    ["50mhr.png", ...imageConfig50, "potmost70.png"],
    createSpecificPieces(
      [`Kit 50cc MALOSSI MHR team : ${compet50Mhr[0]?.cylindre}`,
	   `Vilebrequin JASIL EVO : ${compet50Mhr[0]?.vilo}`],
     [...grosseConfig50, 'potMost70']
    )
  ),
  "50bidalot": createConfig(
    "50cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "50 bidalot wr",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet50Wr,
    ["70bida.png", "vilobida.png", "pvl.png", "vforce.png", "carbu.png", "potbida.png"],
    createSpecificPieces(
      [`Kit 50cc Bidalot WR : ${compet50Wr[0]?.cylindre}`,
	   `Vilebrequin BIDALOT course 39.7mm : ${compet50Wr[0]?.vilo}`,
		`Pot BIDALOT wr 50cc : ${compet50Wr[0]?.pot}`,
		],
	   grosseConfig50
    )
  ),
  "70fast": createConfig(
    "70cc 2Fast",
    `${imagePrefix}/fast.png`,
    "70 fast",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet70Fast,
    ["fastCyl.png", ...imageConfig70, "txt80.png"],
    createSpecificPieces(
      [`70cc 2Fast : ${compet70Fast[0]?.cylindre}`],
      grosseConfig70
    )
  ),
  "70wr": createConfig(
    "70cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "70 wr",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet70Wr,
    ["70bida.png", ...imageConfig70, "txt80.png"],
    createSpecificPieces(
      [`70cc Bidalot WR : ${compet70Wr[0]?.cylindre}`],
      grosseConfig70
    )
  ),
  "70prorace": createConfig(
    "70cc Metrakit pro race",
    `${imagePrefix}/mk.svg`,
    "70 pro race",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet70ProRace,
    ["prorace.png", ...imageConfig70, "txt80.png"],
    createSpecificPieces(
      [`70cc Metrakit pro race : ${compet70ProRace[0]?.cylindre}`],
      grosseConfig70
    )
  ),
  "78xtrem": createConfig(
    "78cc Airsal xtrem",
    `${imagePrefix}/airsal.png`,
    "80 airsal xtrem",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet78xtrem,
    ["airsalxtrem.png", ...imageConfig70, "txt.png"],
    createSpecificPieces(
      [`78cc Airsal xtrem : ${compet78xtrem[0]?.cylindre}`],
      grosseConfig80
    )
  ),
  "78mhr": createConfig(
    "78cc Malossi MHR Team",
    `${imagePrefix}/malossi.png`,
    "80 MHR team",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet78mhr,
    ["50mhr.png", ...imageConfig70, "txt.png"],
    createSpecificPieces(
      [`78cc Malossi MHR Team : ${compet78mhr[0]?.cylindre}`],
      grosseConfig80
    )
  ),
  "78most": createConfig(
    "78cc MOST 4STREET",
    `${imagePrefix}/most.png`,
    "80 most",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet78most,
    ["80most.png", ...imageConfig70, "txt.png"],
    createSpecificPieces(
      [`Kit cylindre 78cc MOST 4street : ${compet78most[0]?.cylindre}`],
      grosseConfig80
    )
  ),
  "80fast": createConfig(
    "80cc 2Fast",
    `${imagePrefix}/fast.png`,
    "80 fast",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet80fast,
    ["fastCyl.png", ...imageConfig , "txt.png"],
    createSpecificPieces(
      [`Kit cylindre 80cc 2Fast : ${compet80fast[0]?.cylindre}`],
      grosseConfig80Course
    )
  ),
  "80wr": createConfig(
    "80cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "80 wr",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet80wr,
    ["70bida.png", ...imageConfig , "txt.png"],
    createSpecificPieces(
      [`Kit cylindre 80cc Bidalot WR : ${compet80wr[0]?.cylindre}`],
      grosseConfig80Course
    )
  ),
  "90wr": createConfig(
    "90cc Bidalot WR",
    `${imagePrefix}/bida.png`,
    "90 wr",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet90wr,
    ["90bida.png", ...imageConfig , "v21.png"],
    createSpecificPieces(
      [`Kit cylindre 90cc Bidalot WR : ${compet90wr[0]?.cylindre}`],
      grosseConfig90Course
    )
  ),
  "90fast": createConfig(
    "90cc 2Fast",
    `${imagePrefix}/fast.png`,
    "90 fast",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet90fast,
    ["fastCyl.png", ...imageConfig , "v21.png"],
    createSpecificPieces(
      [`Kit cylindre 90cc Fast : ${compet90fast[0]?.cylindre}`],
      grosseConfig90Course
    )
  ),
  "100fast": createConfig(
    "100cc 2Fast",
    `${imagePrefix}/fast.png`,
    "100 fast",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet100fast,
    ["fastCyl.png", "vilofast.png", ...imageConfig100],
    createSpecificPieces(
      [`Kit cylindre 100cc 2Fast : ${compet100fast[0]?.cylindre}`,
	  `Vilebrequin 2Fast course 47 : ${compet100fast[0]?.vilo}`
	],
	grosseConfig100Course
    )
  ),
  "96wr": createConfig(
    "96 Bidalot WR",
    `${imagePrefix}/bida.png`,
    "96 wr",
    "Très bonne configuration, peu de couple mais enormément de régime très performant dans ça catégorie. Un entretien très régulier et minutieux est nécessaire. le moteur doit obligatoirement être préparé, nous vous recommandons WRP Racing.",
    config[0]?.compet96bida,
    ["90bida.png", "vilobida48.png", ...imageConfig100],
    createSpecificPieces(
      [`Kit cylindre 96cc Bidalot WR : ${compet96bida[0]?.cylindre}`,
	  `Vilebrequin BIDALOT course 48 : ${compet96bida[0]?.vilo}`
	],
	grosseConfig100Course
    )
  ),
};

const desc = "Compétition"
const type = "AM6"
const type1 = "Derbi"

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
		altlogo: "Doppler",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
		price: config[0]?.compet50Doppler || 'N/A',
		image: "vortex.png",
		configKey: "50doppler" 
    },
    { 
		title: "50cc MHR team",
		logo: "malossi.png",
		alt: "50 mhr team",
		altlogo: "Mhr team",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
		price: config[0]?.compet50Mhr || 'N/A',
		image: "50mhr.png",
		configKey: "50mhr" 
	},
    { 
		title: "50cc Bidalot WR",
		logo: "bida.png",
		alt: "50 bidalot wr",
		altlogo: "Bidalot",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
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
		altlogo: "Fast",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
		price: config[0]?.compet70Fast || 'N/A',
		image: "fastCyl.png",
		configKey: "70fast" 
	},
    { 
		title: "70cc Bidalot WR",
		logo: "bida.png",
		alt: "70 Bidalot WR",
		altlogo: "Bidalot",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
		price: config[0]?.compet70Wr || 'N/A',
		image: "70bida.png",
		configKey: "70wr"
	},
    { 
		title: "70cc Metrakit pro race",
		logo: "mk.svg",
		alt: "70 pro race",
		altlogo: "Metrakit",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
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
		altlogo: "Airsal",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
		price: config[0]?.compet78xtrem|| 'N/A',
		image: "airsalxtrem.png",
		configKey: "78xtrem"
      },
      { 
        title: "78cc MHR Team",
		logo: "malossi.png",
		alt: "80 mhr team",
		altlogo: "Malossi",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
		price: config[0]?.compet78mhr|| 'N/A',
		image: "50mhr.png",
		configKey: "78mhr"
      },
      {
        title: "78cc MOST 4STREET",
        logo: "most.png",
		alt: "80 Most",
		altlogo: "Most",
        description: desc,
		typeMotor1: type1,
		typeMotor: type,
        price: config[0]?.compet78most || 'N/A',
        image: "80most.png",
        configKey: "78most" 
      },
	  {
      	title: "80cc 2Fast",
		logo: "fast.png",
		alt: "80 2Fast",
		altlogo: "Fast",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
		price: config[0]?.compet80fast || 'N/A',
		image: "fastCyl.png",
		configKey: "80fast" 
	  },
	{
		title: "80cc Bidalot WR",
		logo: "bida.png",
		alt: "80 wr",
		altlogo: "Bidalot",
		description: desc,
		typeMotor1: type1,
		typeMotor: type,
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
			altlogo: "Bidalot",
			description: desc,
			typeMotor1: type1,
			typeMotor: type,
			price: config[0]?.compet90wr || 'N/A',
			image: "90bida.png",
			configKey: "90wr" 
		},
		{
			title: "90cc 2Fast",
			logo: "fast.png",
			alt: "90 fast",
			altlogo: "Fast",
			description: desc,
			typeMotor1: type1,
			typeMotor: type,
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
			title: "100cc 2Fast",
			logo: "fast.png",
			alt: "100 fast",
			altlogo: "Fast",
			description: desc,
			typeMotor1: type1,
			typeMotor: type,
			price: config[0]?.compet100fast || 'N/A',
			image: "fastCyl.png",
			configKey: "100fast" 
		},
		{
			title: "96cc Bidalot WR",
			logo: "bida.png",
			alt: "96 wr",
			altlogo: "Bidalot",
			description: desc,
			typeMotor1: type1,
			typeMotor: type,
			price: config[0]?.compet96bida || 'N/A',
			image: "90bida.png",
			configKey: "96wr" 
		},
    ]
  }
];
