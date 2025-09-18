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
				configKey: "https://www.amazon.fr/Muc-Off-Basic-Motorcycle-Cleaning-Kit/dp/B00CYIOR4G/ref=sr_1_1_sspa?crid=NCI1LVRRBPQU&dib=eyJ2IjoiMSJ9.6f4qKvOEx0eqM0SCQugT7df5CYtoy7jRlbrWrwNMOISjfrIH3Rm6ZYrwWZSK2-wieIyYPFbPBLJpU4SS9uiHXmpiRMrBa3s4YGEtVwkNtkk1BR5wxdNmHAAs3drsVgCVtiX-iuwzPHseVQoQe-lvUgn5x2Wy7OKUC9vggRLBuBOiYzADE4AuGmfOKJArinrps7ngV30aWkkcWTG87FIzpItjOycAEIJOV8uLd02iEUB7FroCwqGQn_am1Wigww9mtXexxEv4y0HNGeuh3k_Lre-vyS6xZQbya62NFwTXiu8.b-g_c7-Y6RGHGITrzZFUNqnOwkgG5-Elad90ILFdzdY&dib_tag=se&keywords=nettoyant%2Bmoto&qid=1750955296&sprefix=nettoyant%2Bmoto%2Caps%2C80&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1"
			},
			{
				title: "Vulcanet lingettes nettoyante",
				logo: "logo2.png",
				alt: "Vulcanet lingettes nettoyante",
				price: config[0]?.vulcanet || 'N/A',
				image: "vulcanet.png",
				configKey: "https://www.amazon.fr/-/fr/Vulcanet-Motorcycle-Cleaning-Wipes-Microfibre/dp/B0081RY8WA/ref=sr_1_7?crid=NCI1LVRRBPQU&dib=eyJ2IjoiMSJ9.6f4qKvOEx0eqM0SCQugT7df5CYtoy7jRlbrWrwNMOISjfrIH3Rm6ZYrwWZSK2-wieIyYPFbPBLJpU4SS9uiHXmpiRMrBa3s4YGEtVwkNtkk1BR5wxdNmHAAs3drsVgCVtiX-iuwzPHseVQoQe-lvUgn5x2Wy7OKUC9vggRLBuBOiYzADE4AuGmfOKJArinrps7ngV30aWkkcWTG87FIzpItjOycAEIJOV8uLd02iEUB7FroCwqGQn_am1Wigww9mtXexxEv4y0HNGeuh3k_Lre-vyS6xZQbya62NFwTXiu8.b-g_c7-Y6RGHGITrzZFUNqnOwkgG5-Elad90ILFdzdY&dib_tag=se&keywords=nettoyant+moto&qid=1750955296&sprefix=nettoyant+moto%2Caps%2C80&sr=8-7"
			},
			{
				title: "WD-40 Cire Et Polish",
				logo: "logo2.png",
				alt: "WD-40 Cire Et Polish",
				price: config[0]?.wd || 'N/A',
				image: "wd.png",
				configKey: "https://www.amazon.fr/-/en/Specialist-Aerosol-Extreme-Contains-Carnauba/dp/B00P0YIFBW/ref=sr_1_13?crid=NCI1LVRRBPQU&dib=eyJ2IjoiMSJ9.6f4qKvOEx0eqM0SCQugT7df5CYtoy7jRlbrWrwNMOISjfrIH3Rm6ZYrwWZSK2-wieIyYPFbPBLJpU4SS9uiHXmpiRMrBa3s4YGEtVwkNtkk1BR5wxdNmHAAs3drsVgCVtiX-iuwzPHseVQoQe-lvUgn5x2Wy7OKUC9vggRLBuBOiYzADE4AuGmfOKJArinrps7ngV30aWkkcWTG87FIzpItjOycAEIJOV8uLd02iEUB7FroCwqGQn_am1Wigww9mtXexxEv4y0HNGeuh3k_Lre-vyS6xZQbya62NFwTXiu8.b-g_c7-Y6RGHGITrzZFUNqnOwkgG5-Elad90ILFdzdY&dib_tag=se&keywords=nettoyant%2Bmoto&qid=1750955296&sprefix=nettoyant%2Bmoto%2Caps%2C80&sr=8-13&th=1"
			},
			{
				title: "WD-40 Nettoyant polyvalent",
				logo: "logo2.png",
				alt: "WD-40 Nettoyant polyvalent",
				price: config[0]?.wdSpray || 'N/A',
				image: "wd-spray.png",
				configKey: "https://www.amazon.fr/-/en/Specialist-Multi-Purpose-Materials-Immediate-Effectiveness/dp/B06ZYJWX1G/ref=sr_1_9?crid=NCI1LVRRBPQU&dib=eyJ2IjoiMSJ9.6f4qKvOEx0eqM0SCQugT7df5CYtoy7jRlbrWrwNMOISjfrIH3Rm6ZYrwWZSK2-wieIyYPFbPBLJpU4SS9uiHXmpiRMrBa3s4YGEtVwkNtkk1BR5wxdNmHAAs3drsVgCVtiX-iuwzPHseVQoQe-lvUgn5x2Wy7OKUC9vggRLBuBOiYzADE4AuGmfOKJArinrps7ngV30aWkkcWTG87FIzpItjOycAEIJOV8uLd02iEUB7FroCwqGQn_am1Wigww9mtXexxEv4y0HNGeuh3k_Lre-vyS6xZQbya62NFwTXiu8.b-g_c7-Y6RGHGITrzZFUNqnOwkgG5-Elad90ILFdzdY&dib_tag=se&keywords=nettoyant%2Bmoto&qid=1750955296&sprefix=nettoyant%2Bmoto%2Caps%2C80&sr=8-9&th=1"
			},
			{
				title: "Nettoyant dégraissant freins",
				logo: "logo2.png",
				alt: "Nettoyant dégraissant freins",
				price: config[0]?.nettoyantFrein || 'N/A',
				image: "nettoyant-frein.png",
				configKey: "https://www.amazon.fr/IPONE-Powerful-Degreaser-Spraying-Squeaking/dp/B01F9BAU2C/ref=sr_1_5_sspa?crid=26FYJ90XD8ULB&dib=eyJ2IjoiMSJ9.-zJZSrHLAU64MWpuekxOfFzX7bL44Z_OhHIPjojKHqAXXwAH68iXUzEEZsBv7jgNBJOxjuCaYnoXYt5WwEF9E1hMCT_qfyi1S37CCUGLwWk0DHmE44SfU4S63eHIBDTwFJBb2tDlNyPM-V-qRzOCmmFh3gnI91gv-JBcgfB1-75ZX8fUbk9mtVTzp2utJn0JmGK47q7OKqXpLnr4XbBbAjy2TUEjGCghHtGMx3mS7q4aZJ4hidGC1J264YtcuPQL5F6uD3oSscKDa76BUmOCUJAuIIkPfIh4rUnp8Yqislw.Bc2vbDqdQuIwz9g7D8k8kA0ozKzhkhm9yXtyigx5uio&dib_tag=se&keywords=nettoyant%2Bfrein&qid=1750955368&sprefix=nettoyant%2Bfr%2Caps%2C86&sr=8-5-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1"
			},
			{
				title: "Agent à polir métal Autosol",
				logo: "logo2.png",
				alt: "Agent à polir métal Autosol",
				price: config[0]?.autosol || 'N/A',
				image: "autosol.png",
				configKey: "https://www.amazon.fr/-/en/Autosol-1001000-Metal-Polishing-Schwarz/dp/B003PHLTOG/ref=sr_1_6?crid=1VO5N2UEA0JD4&dib=eyJ2IjoiMSJ9.FJai_JG15wgwX_2uoXPX3O39wNs9AwUAUrhu4t2IwaqcuDIvkrkUql6b42ppgxjZcwrhqVbJ_-s0GAcK2RKzJjkloNxcgw9OgU484j0I17jLELGouEuLmNCymjlbr_-8bx-oEQaJCh8Q-p0fPf-1LE7TyrGZpWK2cQGvtW2HbfmfGOtUowhWHV2J1QKLvbK-fPmd-P1G0LgPN_EBPZeWBZscWryJyMNMr3bazsQoZbpS5FX_jY0BH-6H9AJitMa-I9wonW4MS0l9Vir7MQgSwnLvYSYPmUNvZIhlRpQLjAc.izNbNDePGaZBSOjaA1UXTmWXaRgPzuzp6sVMDw9fGvY&dib_tag=se&keywords=autosol&qid=1750955434&sprefix=autosol%2Caps%2C76&sr=8-6&th=1"
			},
			{
				title: "Nettoyant cuir crème",
				logo: "logo2.png",
				alt: "Nettoyant cuir crème",
				price: config[0]?.cuir || 'N/A',
				image: "cuir.png",
				configKey: "https://www.amazon.fr/-/en/Motul-Motorcycles-Motorcycle-Equipment-Waterproofs/dp/B007814I70/ref=sr_1_21?crid=1JF6VQGR1E9GE&dib=eyJ2IjoiMSJ9.Mr93Inv-tdtm7hfY57gce_7Irk_Hii5KPtnUWDB0VcIsgT66ela72OSRVWP_67M0iQOS3izCGKrwgY3jBzRr-r55aWXaiTROVA8Z1xxAd42FZVhRMDG7QrXuIXxAn0kDZBjqQ9Xsgdqb0RVuuETzLL_Fyi7Ah-sg1nWoGxWtx7Z9y_rEXU1L9WFj-zYMZ45ASvBmd9TJ3689hOpDmUkPAcXLUUzzJ6sE6ExKG-WGK45x7z_2bbJZ_HzE4i3WTjKOgdwW-_Y3qs0L1oJzM06vGo_PXvMQdbIfqFDWocFY2QE.sL1qrDSuSV_h4e2uQB3RYJGrPvo3bohS4G0bGEa6eZM&dib_tag=se&keywords=produit+d%27entretien+moto&qid=1750955663&sprefix=produit+d%27entretien+moto%2Caps%2C77&sr=8-21"
			},
		]
	}
];
