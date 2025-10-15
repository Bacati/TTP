import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Protection de chaussure",
				logo: "logo2.svg",
				alt: "Protection de chaussure",
				price: config[0]?.madbike || 'N/A',
				image: "madbike.png",
				configKey: "https://amzn.to/42IE8j5"
			},
			{
				title: "Support Casque Moto",
				logo: "logo2.svg",
				alt: "Support Casque Moto",
				price: config[0]?.support || 'N/A',
				image: "support.png",
				configKey: "https://amzn.to/4nXRrE6"
			},
			{
				title: "Vis à tête remontante",
				logo: "flush.webp",
				alt: "Vis à tête remontante",
				image: "vis.png",
				configKey: "https://flushfasteners.com/?ref=TROUVETAPIECE"
			},
			{
				title: "Housse de protection",
				logo: "mycover.avif",
				alt: "Housse de protection",
				image: "housse.png",
				configKey: "https://www.mycover-protection.com/fr/?wpam_id=60"
			},
			{
				title: "Support téléphone",
				logo: "logo2.svg",
				alt: "Support téléphone",
				price: config[0]?.supportTel || 'N/A',
				image: "supportTel.png",
				configKey: "https://amzn.to/4o01zfB"
			},
			{
				title: "Applicateur de graisse",
				logo: "logo2.svg",
				alt: "Applicateur de graisse",
				price: config[0]?.appli || 'N/A',
				image: "appli.png",
				configKey: "https://amzn.to/4gTGJwb"
			},
			{
				title: "Cagoule Moto",
				logo: "logo2.svg",
				alt: "Cagoule Moto",
				price: config[0]?.cagoule || 'N/A',
				image: "cagoule.png",
				configKey: "https://amzn.to/4pRZuUW"
			},
			{
				title: "Antivol",
				logo: "mycover.avif",
				alt: "Antivol",
				image: "antivol.png",
				configKey: "https://www.mycover-protection.com/fr/?wpam_id=60"
			},
			{
				title: "Système de communication",
				logo: "logo2.svg",
				alt: "Système de communication",
				price: config[0]?.cardo || 'N/A',
				image: "cardo.png",
				configKey: "https://amzn.to/4gOc4jU"
			},
			{
				title: "Mini compresseur",
				logo: "logo2.svg",
				alt: "Mini compresseur",
				price: config[0]?.gonfleur || 'N/A',
				image: "gonfleur.png",
				configKey: "https://amzn.to/48ujRS3"
			},
			{
				title: "Bequille arrière",
				logo: "logo2.svg",
				alt: "Bequille arrière",
				price: config[0]?.stand || 'N/A',
				image: "stand.png",
				configKey: "https://amzn.to/3IBiJRX"
			},
		]
	}
];
