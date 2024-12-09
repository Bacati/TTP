import { config } from 'libs/donner';

export const getCurrentFrein = (frein: string | number) => configurations[frein] || configurations["test"];
const imagePrefix = "/images";

// Fonction de création de configuration
const createConfig = (title: string, logo: string, alt: string, description: string, link: string, images: any[]) => ({
	title,
	logo,
	alt,
	description,
	link,
	images: images.map((image: any) => `${imagePrefix}/${image}`),
});

const configurations = {
	"mcAdelin": createConfig(
		"Maitre cylindre de frein radial adelin",
		`${imagePrefix}/bks.png`,
		"housse de selle",
		`
		<b>Fabriquant français de housses de selles personnalisées</b> <br> pour motos 50cc (Derbi, Rieju, Beta, Yamaha, MBK,  Sherco, Aprilia, Honda...), kits déco, caches allumages et pièces imprimés en 3D. <br>Votre spécialiste de housse de selle 50cc totalement personnalisable et sur mesure, mousse de guidon personnalisées ainsi que des poignées personnalisable.
		`,
		"https://www.amazon.fr/Qiilu-cylindre-Hydraulique-Embrayage-Cylindre/dp/B0B2Z9PL71?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2PMR0ZSTH95SW&dib=eyJ2IjoiMSJ9.gMQYu05Wr9q4DjLEaLCplhmI5FgKOkKzMOZ7tyVbP7i4uwB5YulRutQixta9Y-cWZHdCUks6EFJVtbAnPn2kKiu3GZoFipOibnOFG6jlD1_579yiWhAgBEvavk6qg7rWE9fNm0eYHS6An8a4PU-WIZeNcV8PPmJl3l-OlVp9-rwOSX-WhDWe4E6HEJCrDN6SlT3BK389auZZjDJifM1xSD6xkZnfpPGByAH0pjVON8oxuc25oSdpCD_3vpYplz-40bR4mbHsOzwu_DdNh1dCVsyqus5gfEO0u8yjiAPnhT4.rnwKDPVCUE8cVMW60ZMD97mM16693vKFrIXExfggYt4&dib_tag=se&keywords=maitre+cylindre+frein+adeline&nsdOptOutParam=true&qid=1733779888&sprefix=maitre+cylindre+frein+adelin%2Caps%2C71&sr=8-6",
		["selle.png", "poignee.png"],
	),
	"test": createConfig(
		"test frein",
		`${imagePrefix}/bks.png`,
		"housse de selle",
		`
		<b>Fabriquant français de housses de selles personnalisées</b> <br> pour motos 50cc (Derbi, Rieju, Beta, Yamaha, MBK,  Sherco, Aprilia, Honda...), kits déco, caches allumages et pièces imprimés en 3D. <br>Votre spécialiste de housse de selle 50cc totalement personnalisable et sur mesure, mousse de guidon personnalisées ainsi que des poignées personnalisable.
		`,
		"https://bikesellier.fr/",
		["selle.png", "poignee.png"],
	),
};

export const categories = [
	{
		products: [
			{
				title: "Maître cylindre Adelin",
				logo: "logo.svg",
				alt: "Maître cylindre Adelin anodisé",
				price: config[0]?.mcAdelin || 'N/A',
				image: "flacon.png",
				configKey: "mcAdelin"
			},
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo.svg",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: "nettesttoyant"
			},
		]
	}
];