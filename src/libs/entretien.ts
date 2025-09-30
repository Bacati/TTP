import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Motul 800 2T",
				logo: "logo2.png",
				alt: "Motul 800 2T",
				price: config[0]?.motul800 || 'N/A',
				image: "motul800.png",
				configKey: "https://amzn.to/4pMgig7"
			},
			{
				title: "Dégraissant de Chaine",
				logo: "logo2.png",
				alt: "Dégraissant de Chaine",
				price: config[0]?.chaine || 'N/A',
				image: "chaine.png",
				configKey: "https://amzn.to/4pUVFhV"
			},
			{
				title: "Graisse de chaîne",
				logo: "logo2.png",
				alt: "Graisse de chaîne",
				price: config[0]?.graisse || 'N/A',
				image: "graisse.png",
				configKey: "https://amzn.to/4pMiBj9"
			},
			{
				title: "Huile de boîte 10w40",
				logo: "logo2.png",
				alt: "Huile de boîte 10w40",
				price: config[0]?.huileBoite || 'N/A',
				image: "boite.png",
				configKey: "https://amzn.to/4npy7jj"
			},
			{
				title: "Bougie d'allumage",
				logo: "logo2.png",
				alt: "Bougie d'allumage",
				price: config[0]?.bougie || 'N/A',
				image: "bougie.png",
				configKey: "https://amzn.to/46Zz0t8"
			},
			{
				title: "Brosse chaîne",
				logo: "logo2.png",
				alt: "Brosse chaîne",
				price: config[0]?.brosse || 'N/A',
				image: "brosse.png",
				configKey: "https://amzn.to/4nvkFut"
			},
			{
				title: "WD-40 Produit Multifonction",
				logo: "logo2.png",
				alt: "WD-40 Produit Multifonction",
				price: config[0]?.wd40 || 'N/A',
				image: "wd40.png",
				configKey: "https://amzn.to/48D1fz1"
			},
		]
	}
];
