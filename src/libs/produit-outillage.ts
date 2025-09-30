import { config } from 'libs/donner';

export const getCurrentProduit = (produits: string | number) => configurations[produits] || configurations["nettoyant"];
const imagePrefix = "/images";

// Fonction de création de configuration
const createConfig = (title: string, logo: string, alt: string, description: string, price: number | undefined, images: any[]) => ({
	title,
	logo,
	alt,
	description,
	price,
	images: images.map((image: any) => `${imagePrefix}/${image}`),
});

const configurations = {
	"nettoyant": createConfig(
		"Nettoyant pour Pots TTP - 120ml",
		`${imagePrefix}/logo2.png`,
		"Nettoyant TTP",
		`
		<p class="mb-2">Notre nettoyant pour pots est spécialement conçu pour éliminer efficacement le brunissement et les résidus tenaces qui s'accumulent sur vos pots. En plus de redonner de l’éclat à vos surfaces, il forme une barrière protectrice contre la rouille, prolongeant ainsi la durée de vie de vos ustensiles.</p>
		<p class="font-bold text-xl mb-2">Conseils d'utilisation :</p>
		<ul class="ml-4 mb-2">
			<li class="mb-2">1. Bien agiter avant chaque utilisation pour une efficacité optimale.</li>
			<li class="mb-2">2. Porter des gants pour protéger vos mains pendant l'application.</li>
			<li class="mb-2">3. Appliquer le produit en petite quantité sur les surfaces à nettoyer.</li>
			<li class="mb-2">4. Puis frotter avec un chiffon.</li>
		</ul>
		<p class="font-bold text-xl">Précautions :</p>
		<ul class="ml-4 mb-2">
			<li class="mb-2">Conserver à température ambiante, entre 10°C et 30°C.</li>
			<li class="mb-2">Ne pas consommer, ne pas mettre dans les yeux.</li>
			<li class="mb-2">Produit inflammable : tenir à l’écart des sources de chaleur et des flammes.</li>
		</ul>

		<p>Offert dans un format de 120 ml, ce nettoyant est ultra-efficace pour les tâches les plus incrustées, tout en étant facile à stocker et à utiliser.</p>
		`,
		config[0]?.clearPot,
		["flacon.png", "flacon.png"],
	),
};

// Catégories de produits
export const categories = [
	{
		products: [
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo2.png",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: "/product/produit?produit=nettoyant"
			},
			{
				title: "Kit nettoyage Muc-Off",
				logo: "logo2.png",
				alt: "Kit nettoyage Muc-Off",
				price: config[0]?.kitNettoyage || 'N/A',
				image: "kit-nettoyage.png",
				configKey: "https://amzn.to/48qy56r"
			},
			{
				title: "Vulcanet lingettes nettoyante",
				logo: "logo2.png",
				alt: "Vulcanet lingettes nettoyante",
				price: config[0]?.vulcanet || 'N/A',
				image: "vulcanet.png",
				configKey: "https://amzn.to/3WjreUI"
			},
			{
				title: "WD-40 Cire Et Polish",
				logo: "logo2.png",
				alt: "WD-40 Cire Et Polish",
				price: config[0]?.wd || 'N/A',
				image: "wd.png",
				configKey: "https://amzn.to/3VIfAmb"
			},
			{
				title: "WD-40 Nettoyant polyvalent",
				logo: "logo2.png",
				alt: "WD-40 Nettoyant polyvalent",
				price: config[0]?.wdSpray || 'N/A',
				image: "wd-spray.png",
				configKey: "https://amzn.to/4mGseNs"
			},
			{
				title: "Nettoyant dégraissant freins",
				logo: "logo2.png",
				alt: "Nettoyant dégraissant freins",
				price: config[0]?.nettoyantFrein || 'N/A',
				image: "nettoyant-frein.png",
				configKey: "https://amzn.to/3VHQLH2"
			},
			{
				title: "Agent à polir métal Autosol",
				logo: "logo2.png",
				alt: "Agent à polir métal Autosol",
				price: config[0]?.autosol || 'N/A',
				image: "autosol.png",
				configKey: "https://amzn.to/3INHKt5"
			},
			{
				title: "Nettoyant cuir crème",
				logo: "logo2.png",
				alt: "Nettoyant cuir crème",
				price: config[0]?.cuir || 'N/A',
				image: "cuir.png",
				configKey: "https://amzn.to/3VHQCU8"
			},
		]
	}
];
