import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Outils multifonctions",
				logo: "logo2.svg",
				alt: "Outils multifonctions",
				price: config[0]?.dremel || 'N/A',
				image: "dremel.png",
				configKey: "https://amzn.to/3ILY2md"
			},
			{
				title: "Renvoi d'angle",
				logo: "logo2.svg",
				alt: "Renvoi d'angle",
				price: config[0]?.renvoie || 'N/A',
				image: "renvoie.png",
				configKey: "https://amzn.to/3KllN5h"
			},
			{
				title: "Jeu de Fraises Rotatives",
				logo: "logo2.svg",
				alt: "Jeu de Fraises Rotatives",
				price: config[0]?.fraise || 'N/A',
				image: "fraise.png",
				configKey: "https://amzn.to/46B8o04"
			},
		]
	}
];
