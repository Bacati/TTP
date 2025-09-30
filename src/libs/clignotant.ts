import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Clignotant progressif",
				logo: "logo2.png",
				alt: "Clignotant progressif",
				price: config[0]?.progressif || 'N/A',
				image: "cligno-progressif.png",
				configKey: "https://amzn.to/3VEh7K7"
			},
			{
				title: "Clignotant style street",
				logo: "logo2.png",
				alt: "Clignotant street",
				price: config[0]?.street || 'N/A',
				image: "street.png",
				configKey: "https://amzn.to/4nXN6RE"
			},
			{
				title: "Clignotant Greluma",
				logo: "logo2.png",
				alt: "Clignotant Greluma",
				price: config[0]?.greluma || 'N/A',
				image: "greluma.png",
				configKey: "https://amzn.to/4nXODqS"
			},
			{
				title: "Clignotant au guidon",
				logo: "logo2.png",
				alt: "Clignotant au guidon",
				price: config[0]?.guidon || 'N/A',
				image: "guidon.png",
				configKey: "https://amzn.to/4mMAuMb"
			},
			{
				title: "Clignotant autocollant",
				logo: "logo2.png",
				alt: "Clignotant autocollant",
				price: config[0]?.autocollant || 'N/A',
				image: "autocollant.png",
				configKey: "https://amzn.to/3VE3Np4"
			},
		]
	}
];
