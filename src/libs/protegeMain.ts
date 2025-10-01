import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Protège levier",
				logo: "logo2.png",
				alt: "Protège levier",
				price: config[0]?.horse || 'N/A',
				image: "protege-levier.png",
				configKey: "https://amzn.to/3IpF70F"
			},
			{
				title: "Protège main clignotant intégré",
				logo: "logo2.png",
				alt: "Protège main clignotant intégré",
				price: config[0]?.evomosa || 'N/A',
				image: "evomosa.png",
				configKey: "https://amzn.to/4gU4ww6"
			},
			{
				title: "JFG RACING Protege Main",
				logo: "logo2.png",
				alt: "JFG RACING Protege Main",
				price: config[0]?.jfg || 'N/A',
				image: "jfg.png",
				configKey: "https://amzn.to/4mMlYDT"
			},
			{
				title: "Barre en Aluminium protège main",
				logo: "logo2.png",
				alt: "Barre en Aluminium protège main",
				price: config[0]?.barreAlu || 'N/A',
				image: "barreAlu.png",
				configKey: "https://amzn.to/46O16q3"
			},
			{
				title: "Déflecteur de vent",
				logo: "logo2.png",
				alt: "Déflecteur de vent",
				price: config[0]?.vent || 'N/A',
				image: "vent.png",
				configKey: "https://amzn.to/4mCenrv"
			},
			{
				title: "Protections de guidon",
				logo: "logo2.png",
				alt: "Protections de guidon",
				price: config[0]?.protec || 'N/A',
				image: "protec.png",
				configKey: "https://amzn.to/4pL1wpX"
			},
		]
	}
]
