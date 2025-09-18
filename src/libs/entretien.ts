import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Motul 800 2T",
				logo: "logo2.png",
				alt: "Motul 800 2T",
				price: config[0]?.motul800 || 'N/A',
				image: "motul800.png",
				configKey: "https://www.amazon.fr/Motul-104041-Factory-Line-Racing/dp/B00IKCXZNY/ref=sr_1_6?dib=eyJ2IjoiMSJ9.zuKP73tmWKA1b3Z7UJ2J2-Fl9qxEt5EQC2gu4pOSS4DhPVl1v4wYOvcoVMa3viRnIOazcd1ISNg4LOftaa76uswMQNv47AUXMoB24L8y0XlORgMnV9JH6iSjyKJmjBoYshZZND0gusgu3gX8fPmnEGwlQ1GDkdehIjLkM7AC9YCfCm3GbMh3lLu4hwxx7egNIOgdivD6yUE49_AKWUgfLM86PHoY4ROSoAlwxT--FBNqHnMzGJgaSKFFciMMN5aGXYQyMPDuZ5ZJZVUPl2-4kHOyQHee5ieZ1TfrhFrKmRw.ewIjdGex5jQQGA3w25V6b61Rc3rg9yOtV50QIgIWTz0&dib_tag=se&keywords=Motul+800+2t&qid=1758190238&sr=8-6"
			},
			{
				title: "Dégraissant de Chaine",
				logo: "logo2.png",
				alt: "Dégraissant de Chaine",
				price: config[0]?.chaine || 'N/A',
				image: "chaine.png",
				configKey: "https://www.amazon.fr/IPONE-Motorcycle-Chain-Cleaner-Degreaser/dp/B01HB8JXAQ/ref=sr_1_5_sspa?crid=NCI1LVRRBPQU&dib=eyJ2IjoiMSJ9.6f4qKvOEx0eqM0SCQugT7df5CYtoy7jRlbrWrwNMOISjfrIH3Rm6ZYrwWZSK2-wieIyYPFbPBLJpU4SS9uiHXmpiRMrBa3s4YGEtVwkNtkk1BR5wxdNmHAAs3drsVgCVtiX-iuwzPHseVQoQe-lvUgn5x2Wy7OKUC9vggRLBuBOiYzADE4AuGmfOKJArinrps7ngV30aWkkcWTG87FIzpItjOycAEIJOV8uLd02iEUB7FroCwqGQn_am1Wigww9mtXexxEv4y0HNGeuh3k_Lre-vyS6xZQbya62NFwTXiu8.b-g_c7-Y6RGHGITrzZFUNqnOwkgG5-Elad90ILFdzdY&dib_tag=se&keywords=nettoyant%2Bmoto&qid=1750955296&sprefix=nettoyant%2Bmoto%2Caps%2C80&sr=8-5-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1"
			},
			{
				title: "Graisse de chaîne",
				logo: "logo2.png",
				alt: "Graisse de chaîne",
				price: config[0]?.graisse || 'N/A',
				image: "graisse.png",
				configKey: "https://www.amazon.fr/IPONE-Motorcycle-Multi-position-projection-application/dp/B01DD6WC76/ref=sr_1_4_sspa?crid=1512JIZBGUYKK&dib=eyJ2IjoiMSJ9.tP8SOodx6b2NprMBrBe-rFK_y1ujCgWwfkVv8-NU6qvQGe5Ck3uzlnpG5p0BHm0WUhm8wwHW-NCMTj1F7E1G1_rFXsbwHsLPfE3cHv3V02mYs3tq-bNESLLVmwngKZVt1o8WCbYz8rCLtmCDESNjZbcm_lQbqIH9u4zfsAPDQ0MXF2j-3ZOmPUIQYXHx6FhmwaKX71nXaQKtOGHCVQ5sRq65zyO9reQuR3BoWJy_q7dRvEPYdws3fgYrt2pG-OovHM6NaE6-SXZHKQk3sckxCwYZBAwb7d7EKIp5YQnrDQw.tUSqndh9xBJbPqYIU7ULm_ecYgWSlVO5S6PICC6ZB3s&dib_tag=se&keywords=graisse%2Bchaine%2Bmoto&qid=1750955456&sprefix=graiss%2Caps%2C84&sr=8-4-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1"
			},
			{
				title: "Huile de boîte 10w40",
				logo: "logo2.png",
				alt: "Huile de boîte 10w40",
				price: config[0]?.huileBoite || 'N/A',
				image: "boite.png",
				configKey: ""
			},
			{
				title: "Bougie d'allumage",
				logo: "logo2.png",
				alt: "Bougie d'allumage",
				price: config[0]?.bougie || 'N/A',
				image: "bougie.png",
				configKey: "https://www.amazon.fr/-/en/NGK-Spark-Plug-IGNITION-BR9ES/dp/B0BKTD98JM/ref=sr_1_5?crid=115CWDHIUES1V&dib=eyJ2IjoiMSJ9.nTFgudm3mzNUtkBvFdiaVls7TD-wppPx1Es8pqJqGcupznu-oG4op7mdSmyEXWoLdKSovvo1nBR0l46iYRjuM219IFPGYCaV9Oh9z7K56B1qxxz3nyc5Z1AkqnJnu8o2WSv5hEvOfSSfpSyx6Zy8fdgBMMU_Y1prOuPMVXrT7NeNVsAc3pyPhYvmhDdGht3k-yqxKdL6Jvt8hW85GU5lWnHEMRA61tD7MRxoUYSKLfrMGcfsOV_wYP3AZSfbit3TNtg2EzHZTeC4IeG-PpvbUiDnwRYAil5UYeXM6WW2PCo.hSPaLSYBgzx1lPrkCdlqpuKOokUnL0YUxvdPNFlVE2A&dib_tag=se&keywords=bougie%2Bbr9es&qid=1750955744&sprefix=bougie%2Bbr%2Caps%2C88&sr=8-5&th=1"
			},
			{
				title: "Brosse chaîne",
				logo: "logo2.png",
				alt: "Brosse chaîne",
				price: config[0]?.brosse || 'N/A',
				image: "brosse.png",
				configKey: "https://www.amazon.fr/MMOBIEL-Motorcycle-Chain-Brush-Cleaning/dp/B07VJHWVB6/ref=sr_1_3_sspa?crid=96QHLIJ28VUJ&dib=eyJ2IjoiMSJ9.Hw2wVt5O6dyFrpA4DrxKwgUYmSnV0YfoFz3sDtu6pGkU9s99HwMvnJy-Ja3MNvpwH_SJjLQ6j4YGr2yUV1pMmMfwI6PCWysBqJt02TyyQERwEfw5TlaxF57c63nMTX-pp2VLEcmPF4CRTAFV5zqwW2uMBTwUIx1GJcVudkz-QT1vngz8S_niPo38Ve_SfZZVwZDtdaF8_76Zl99uEz637dv65XUpelrTA65bvqObD4XFaMwbSVIUAiebt8-FOpbFIJfG0wJTa1-0y7FuhoDWT5iRqqhPwiNNvsHPkA_hX64.gm-Vggz5v6QFeuXMcKmiO5DBqZlErjkDXTeShJFdk9M&dib_tag=se&keywords=brosse+chaine+moto&qid=1750955834&sprefix=brosse+chaine+moto%2Caps%2C63&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
			},
			{
				title: "Huile de boîte 10w40",
				logo: "logo2.png",
				alt: "Huile de boîte 10w40",
				price: config[0]?.huileBoite || 'N/A',
				image: "boite.png",
				configKey: ""
			},
		]
	}
];
