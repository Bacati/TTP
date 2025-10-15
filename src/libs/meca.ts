import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Clé à Chocs",
				logo: "logo2.svg",
				alt: "Clé à Chocs",
				price: config[0]?.peteuse || 'N/A',
				image: "peteuse.png",
				configKey: "https://amzn.to/3KuqucU"
			},
			{
				title: "Chariot à outils 156 pièces",
				logo: "logo2.svg",
				alt: "Chariot à outils 156 pièces",
				price: config[0]?.caisse || 'N/A',
				image: "caisse.png",
				configKey: "https://amzn.to/4nt66rb"
			},
			{
				title: "Outil Montage Roulements Vilebrequin",
				logo: "logo2.svg",
				alt: "Outil Montage Roulements Vilebrequin",
				price: config[0]?.montageRoulement || 'N/A',
				image: "montageRoulement.png",
				configKey: "https://amzn.to/4nMkonb"
			},
			{
				title: "Extracteur de Roulement",
				logo: "logo2.svg",
				alt: "Extracteur de Roulement",
				price: config[0]?.extracteur || 'N/A',
				image: "extracteur.png",
				configKey: "https://amzn.to/48IcWEB"
			},
			{
				title: "Extracteur de Roulement 4PCs",
				logo: "logo2.svg",
				alt: "Extracteur de Roulement 4PCs",
				price: config[0]?.branche3 || 'N/A',
				image: "troisBranche.png",
				configKey: "https://amzn.to/4pJ64x3"
			},
			{
				title: "Extracteurs de roulements",
				logo: "logo2.svg",
				alt: "Extracteurs de roulements",
				price: config[0]?.dayuan || 'N/A',
				image: "dayuan.png",
				configKey: "https://amzn.to/4pO7bLK"
			},
			{
				title: "Arrache à inertie",
				logo: "logo2.svg",
				alt: "Arrache à inertie",
				price: config[0]?.inertie || 'N/A',
				image: "inertie.png",
				configKey: "https://amzn.to/3KsPu4s"
			},
		]
	}
];
