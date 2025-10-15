import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Polisport E-blaze Headlight",
				logo: "logo2.svg",
				alt: "Polisport E-blaze Headlight",
				price: config[0]?.poli || 'N/A',
				image: "polisport.png",
				configKey: "https://amzn.to/4pJ54sN"
			},
			{
				title: "PRETTYLE Phare de LED",
				logo: "logo2.svg",
				alt: "PRETTYLE Phare de LED",
				price: config[0]?.prettyle || 'N/A',
				image: "prettyle.png",
				configKey: "https://amzn.to/4nW73If"
			},
			{
				title: "LOTFI Phare LED",
				logo: "logo2.svg",
				alt: "LOTFI Phare LED",
				price: config[0]?.exc || 'N/A',
				image: "exc.png",
				configKey: "https://amzn.to/4pMfSq3"
			},
			{
				title: "Feu Arrière de Moto",
				logo: "logo2.svg",
				alt: "Feu Arrière de Moto",
				price: config[0]?.arriere || 'N/A',
				image: "arriere.png",
				configKey: "https://amzn.to/4pHQAct"
			},
			{
				title: "Barre de feu arrière",
				logo: "logo2.svg",
				alt: "Barre de feu arrière",
				price: config[0]?.barre || 'N/A',
				image: "barre.png",
				configKey: "https://amzn.to/4pNdPBT"
			},
			{
				title: "YnGia Feu arrière",
				logo: "logo2.svg",
				alt: "YnGia Feu arrière",
				price: config[0]?.yngia || 'N/A',
				image: "yngia.png",
				configKey: "https://amzn.to/4gRyKQn"
			},
		]
	}
]
