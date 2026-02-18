const linkPrefix = "/product/config?config=";
const linkPrefixProduct = "/product/produit?produit="
const imagePrefix = "/images";

// Fonction pour générer des données produits à partir de `config`
export const generateProductData = (config) => [
  {
    title: "Kits décos -10%",
    logo: "gxs.jpg",
    alt: "kit déco perso",
    description: "GXS Racing - Personnalise ta moto avec un kit déco UNIQUE ! Code -10% SPCODE_XARUO",
    imageSrc: `${imagePrefix}/lucas.png`,
    link: "https://gxs-racing.com/fr/?refs=8350"
  },
  {
		title: "Vis à tête remontante",
		logo: "flush.webp",
		alt: "Vis à tête remontante",
		imageSrc: `${imagePrefix}/vis.png`,
		link: "https://flushfasteners.com/?ref=TROUVETAPIECE",
	},
  {
    title: "Nettoyant pot",
    logo: "logo2.svg",
    alt: "Nettoyant ttp",
    description: "Trouve ta pièce",
    price: config[0].clearPot || 'N/A',
    imageSrc: `${imagePrefix}/flacon.png`,
    link: `${linkPrefixProduct}nettoyant`
  },
  {
    title: "Housse de protection",
    logo: "mycover.avif",
    alt: "Housse de protection",
    imageSrc: `${imagePrefix}/housse.png`,
    link: `https://www.mycover-protection.com/?wpam_id=60`
  },
  {
    title: "Impression 3d",
    logo:  "lmr.png",
    alt: "LMR 3D",
    description: "LMR 3D Objet cassé, pièce rare ou création sur mesure ? Nous concevons et imprimons en 3D tout ce dont vous avez besoin.",
    imageSrc: `${imagePrefix}/cacheAllumage.png`,
    link: "https://www.lmr3d.com/?ref=TTP"
  },
  {
    title: "Fabriquant Carbone",
    logo: "of.jpg",
    alt: "moulage Carbone",
    description: "OF Carbon fabiquant de pièces carbone tissé / brut / forged",
    imageSrc: `${imagePrefix}/carbone.png`,
    link: "https://www.instagram.com/of_carbon/"
  },
  {
    title: "Kit nettoyage Muc-Off",
    logo: "logo2.svg",
    alt: "Kit nettoyage Muc-Off",
    price: config[0]?.kitNettoyage || 'N/A',
    imageSrc: `${imagePrefix}/kit-nettoyage.png`,
    link: "https://mucoff.sjv.io/WynWgP"
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
