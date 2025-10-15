import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Pige de Calage Comparateur",
				logo: "logo2.svg",
				alt: "Pige de Calage Comparateur",
				price: config[0]?.pige || 'N/A',
				image: "pige.png",
				configKey: "https://amzn.to/46M18Pd"
			},
			{
				title: "Jauge d'alésage",
				logo: "logo2.svg",
				alt: "Jauge d'alésage",
				price: config[0]?.alesage || 'N/A',
				image: "alesage.png",
				configKey: "https://amzn.to/4gPYah9"
			},
			{
				title: "Rapporteur circulaire gradué",
				logo: "logo2.svg",
				alt: "Rapporteur circulaire gradué",
				price: config[0]?.disque || 'N/A',
				image: "disque.png",
				configKey: "https://amzn.to/488FcQD"
			},
			{
				title: "Pied a Coulisse",
				logo: "logo2.svg",
				alt: "Pied a Coulisse",
				price: config[0]?.pied || 'N/A',
				image: "pied.png",
				configKey: "https://amzn.to/4mLrJlw"
			},
			{
				title: "Clé Dynamométrique",
				logo: "logo2.svg",
				alt: "Clé Dynamométrique",
				price: config[0]?.dynamo || 'N/A',
				image: "dynamo.png",
				configKey: "https://amzn.to/4mDaJhj"
			},
			{
				title: "Burette graduié",
				logo: "logo2.svg",
				alt: "Burette graduié",
				price: config[0]?.burette || 'N/A',
				image: "burette.png",
				configKey: "https://amzn.to/3Wh4zII"
			},
		]
	}
];
