const linkPrefix = "/product/config?config=";
const linkPrefixCompet = "/product/config?configCompetition=";
const linkPrefixProduct = "/product/produit?produit="
const imagePrefix = "/images";

// Fonction pour générer des données produits à partir de `config`
export const generateProductData = (config) => [
  {
    title: "50cc Metrakit Alu",
    logo: "mk.svg",
    alt: "50 Metrakit",
    description: "Configuration AllDays",
    typeMotor1: "Derbi",
    typeMotor: "AM6",
    price: config[0].allMk || 'N/A',
    imageSrc: `${imagePrefix}/50mk.png`,
    link: `${linkPrefix}50mk`
  },
  {
		title: "70cc 2Fast",
		logo: "fast.png",
		alt: "70 2Fast",
		description: "Compétition",
		typeMotor1: "Derbi",
		typeMotor: "AM6",
		price: config[0]?.compet70Fast || 'N/A',
		imageSrc: `${imagePrefix}/fastCyl.png`,
		link: `${linkPrefixCompet}70fast`
	},
  {
    title: "Nettoyant pot",
    logo: "logo.svg",
    alt: "Nettoyant ttp",
    description: "Trouve ta pièce",
    price: config[0].clearPot || 'N/A',
    imageSrc: `${imagePrefix}/flacon.png`,
    link: `${linkPrefixProduct}nettoyant`
  },
  {
    title: "70cc Airsal Alu",
    logo: "airsal.png",
    alt: "70 airsal",
    description: "Configuration AllDays",
    typeMotor: "AM6",
    typeMotor1: "Derbi",
    price: config[0].allAirsalAlu || 'N/A',
    imageSrc: `${imagePrefix}/70airsal.png`,
    link: `${linkPrefix}70airsalAlu`
  },
  {
    title: "75cc Top performance",
    logo: "top.webp",
    alt: "75 top rose",
    description: "Configuration AllDays",
    typeMotor: "AM6",
    price: config[0].allTopRose || 'N/A',
    imageSrc: `${imagePrefix}/toprose.png`,
    link: `${linkPrefix}75topRose`
  },
  {
    title: "78cc Airsal alu",
    logo: "airsal.png",
    alt: "80 airsal",
    description: "Configuration AllDays",
    typeMotor: "AM6",
    price: config[0].all78Airsal || 'N/A',
    imageSrc: `${imagePrefix}/70airsal.png`,
    link: `${linkPrefix}78airsal`
  },
  {
    title: "78cc BRK 4RACE",
    logo: "brk.png",
    alt: "80 brk",
    description: "Configuration AllDays",
    typeMotor: "AM6",
    typeMotor1: "Derbi",
    price: config[0].all78brk || 'N/A',
    imageSrc: `${imagePrefix}/80brk.png`,
    link: `${linkPrefix}78brk`
  },
  {
    title: "86cc Top performance",
    logo: "top.webp",
    alt: "86 top alu",
    description: "Configuration AllDays",
    typeMotor: "AM6",
    price: config[0].allTopalu || 'N/A',
    imageSrc: `${imagePrefix}/topalu.png`,
    link: `${linkPrefix}86top`
  },
  {
    title: "78cc MOST 4STREET",
    logo: "most.png",
    alt: "80 most",
    description: "Configuration AllDays",
    typeMotor: "AM6",
    typeMotor1: "Derbi",
    price: config[0].all78Most || 'N/A',
    imageSrc: `${imagePrefix}/80most.png`,
    link: `${linkPrefix}78most`
  },
];