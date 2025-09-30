import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "AGV K1",
				logo: "logo2.png",
				alt: "AGV K1",
				price: config[0]?.k1 || 'N/A',
				image: "k1.png",
				configKey: "https://amzn.to/4pO6Bxy"
			},
			{
				title: "Casque modulable",
				logo: "logo2.png",
				alt: "Casque modulable",
				price: config[0]?.rabat || 'N/A',
				image: "rabat.png",
				configKey: "https://amzn.to/4gWCf8g"
			},
			{
				title: "Bell Full-9 Fusion",
				logo: "logo2.png",
				alt: "Bell Full-9 Fusion",
				price: config[0]?.full9 || 'N/A',
				image: "full9.png",
				configKey: "https://amzn.to/4pOHR8n"
			},
			{
				title: "Shark varial carbon",
				logo: "logo2.png",
				alt: "Shark varial carbon",
				price: config[0]?.shark || 'N/A',
				image: "shark.png",
				configKey: "https://amzn.to/46u0JSB"
			},
		]
	}
];
