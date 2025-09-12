import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "combi",
				logo: "logo2.png",
				alt: "Maître cylindre Adelin anodisé",
				price: config[0]?.mcAdelin || 'N/A',
				image: "mcAdelin.png",
				configKey: ""
			},
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo2.png",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: ""
			},
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo2.png",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: ""
			},
		]
	}
];
