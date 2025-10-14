import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Système de transport",
				logo: "risk.avif",
				alt: "Système de transport",
				price: config[0]?.calePied || 'N/A',
				image: "cale-pied.png",
				configKey: "https://amzn.to/42IE8j5"
			},
			{
				title: "Système de transport PRO",
				logo: "risk.avif",
				alt: "Système de transport PRO",
				price: config[0]?.calePiedPro || 'N/A',
				image: "fixation-moto.png",
				configKey: "https://amzn.to/4nXRrE6"
			},
			{
				title: "Lève moto ajustable",
				logo: "risk.avif",
				alt: "Lève moto ajustable",
				price: config[0]?.leveMoto || 'N/A',
				image: "leve-moto.png",
				configKey: "https://amzn.to/4o01zfB"
			},
			{
				title: "Grille de départ électronique",
				logo: "risk.avif",
				alt: "Grille de départ électronique",
				price: config[0]?.grille || 'N/A',
				image: "grille.png",
				configKey: "https://amzn.to/4gTGJwb"
			},
			{
				title: "Élévateur / support",
				logo: "risk.avif",
				alt: "Élévateur / support",
				price: config[0]?.elevateur || 'N/A',
				image: "leve-moto-pliable.png",
				configKey: "https://amzn.to/4pRZuUW"
			},
			{
				title: "Starting block",
				logo: "risk.avif",
				alt: "Starting block",
				price: config[0]?.start || 'N/A',
				image: "support-pied.png",
				configKey: "https://amzn.to/4pRZuUW"
			},
		]
	}
];
