import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Kit d'embrayage et Levier",
				logo: "logo2.png",
				alt: "Kit d'embrayage et Levier",
				price: config[0]?.embro || 'N/A',
				image: "embro.png",
				configKey: "https://amzn.to/3KzfBqa"
			},
			{
				title: "Levier CNC",
				logo: "logo2.png",
				alt: "Levier CNC",
				price: config[0]?.woostar || 'N/A',
				image: "woostar.png",
				configKey: "https://amzn.to/3IN67Hr"
			},
			{
				title: "Levier universel",
				logo: "logo2.png",
				alt: "Levier universel",
				price: config[0]?.universal || 'N/A',
				image: "universal.png",
				configKey: "https://amzn.to/46wC6ol"
			},
			{
				title: "Levier CNC 19 RCS",
				logo: "logo2.png",
				alt: "Levier CNC 19 RCS",
				price: config[0]?.rcs || 'N/A',
				image: "rcs.png",
				configKey: "https://amzn.to/4pPWAA5"
			},
			{
				title: "Maître cylindre Adelin",
				logo: "logo2.png",
				alt: "Maître cylindre Adelin",
				price: config[0]?.mcAdelin || 'N/A',
				image: "mcAdelin.png",
				configKey: "https://amzn.to/3KOJYsK"
			},
			{
				title: "Levier d'embrayage À Roulement",
				logo: "logo2.png",
				alt: "Levier d'embrayage À Roulement",
				price: config[0]?.clutch || 'N/A',
				image: "clutch.png",
				configKey: "https://amzn.to/4gRJ5Md"
			},
		]
	}
]
