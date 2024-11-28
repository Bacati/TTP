export const getCurrentEsthe = (esthetique: string | number) => configurations[esthetique] || configurations["bks"];
const imagePrefix = "/images";

// Fonction de création de configuration
const createConfig = (title: string, logo: string, alt: string, description: string, link: string, images: any[]) => ({
	title,
	logo,
	alt,
	description,
	link,
	images: images.map((image: any) => `${imagePrefix}/${image}`),
});

const configurations = {
	"bks": createConfig(
		"Bikes sellier",
		`${imagePrefix}/bks.png`,
		"housse de selle",
		`
		<b>Fabriquant français de housses de selles personnalisées</b> <br> pour motos 50cc (Derbi, Rieju, Beta, Yamaha, MBK,  Sherco, Aprilia, Honda...), kits déco, caches allumages et pièces imprimés en 3D. <br>Votre spécialiste de housse de selle 50cc totalement personnalisable et sur mesure, mousse de guidon personnalisées ainsi que des poignées personnalisable.
		`,
		"https://bikesellier.fr/",
		["selle.png", "poignee.png"],
	),
	"test": createConfig(
		"test",
		`${imagePrefix}/bks.png`,
		"housse de selle",
		`
		<b>Fabriquant français de housses de selles personnalisées</b> <br> pour motos 50cc (Derbi, Rieju, Beta, Yamaha, MBK,  Sherco, Aprilia, Honda...), kits déco, caches allumages et pièces imprimés en 3D. <br>Votre spécialiste de housse de selle 50cc totalement personnalisable et sur mesure, mousse de guidon personnalisées ainsi que des poignées personnalisable.
		`,
		"https://bikesellier.fr/",
		["selle.png", "poignee.png"],
	),
};

