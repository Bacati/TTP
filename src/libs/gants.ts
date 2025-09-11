import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "gants",
				logo: "logo.svg",
				alt: "Maître cylindre Adelin anodisé",
				price: config[0]?.mcAdelin || 'N/A',
				image: "mcAdelin.png",
				configKey: ""
			},
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo.svg",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: ""
			},
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo.svg",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: ""
			},
		]
	}
];
