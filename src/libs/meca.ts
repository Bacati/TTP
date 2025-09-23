import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "Clé à Chocs",
				logo: "logo2.png",
				alt: "Clé à Chocs",
				price: config[0]?.peteuse || 'N/A',
				image: "peteuse.png",
				configKey: "https://www.amazon.fr/ADPB320-Cordless-Impact-Battery-Brushless/dp/B0DWDSLZQL/ref=sr_1_1_sspa?crid=68N69W1DXT9P&dib=eyJ2IjoiMSJ9.SVoAvBDoI9yyUXd4F7xJwDRN_OyKEbAIEcmVyUv1mKZ8ltdBSujWTXqGwDHPUZ7IqtgnMr0R029fDUeooF0dHlbBYHCeqvhjGfLWK_GhXpblklbprd-TiqRlVrFPScIHT6_hwX0NIBlsMkK-A_wa97C6MRGfyHxKRPofCAlbchtIcmCbJqZirYWKrt1SR9UNvmyGt_qNgVno9nNWbqrN5Q-aTbw7fGTfzhnvlWVBBQWHFOPz_iXZDYKr1avoJPT6B_gX5v_RqwZ-aUkFV13KoIMylzeWXr0hbFzCLaqgeOs.qBDfSp4c1voHzKc6ulCSSPa0Kev6R6SmgiA6UED1ADw&dib_tag=se&keywords=cl%C3%A9+a+choc+sans+fil&qid=1750956729&sprefix=cl%C3%A9+a+%2Caps%2C88&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
			},
			{
				title: "Chariot à outils 156 pièces",
				logo: "logo2.png",
				alt: "Chariot à outils 156 pièces",
				price: config[0]?.caisse || 'N/A',
				image: "caisse.png",
				configKey: "https://www.amazon.fr/Meister-Trolley-Telescopic-Professional-8971440/dp/B01N6LB4V4/ref=sr_1_5_sspa?crid=2WZ8OYCH2WCHG&dib=eyJ2IjoiMSJ9.XstTgyTmqb6khnepuGjBXN9EvW0b3Jy6jPUoc3tFSho9wbNq3D4O32eEK-IbTdMZ-T5aGYcTjxNF1N13RvVXdsay3kl0vxYfSsPth329L6YXCa6AGRHm-myUT_Xkk0O2H70M82GCjhIUkoWsMg8jeOpbAqnqLSX7OhxK3miW81H0UPwLvH26gU59pOFMX8CGvt7w6VEVD46IoNk7Dr0DDT-mBquST_q1zYW2gJDswM9p8MuxUfk2jtQNgAGPnPjkZlyExK08KYWmhkm3t-uCtAyehxxyfCOODYrIiPHyzNA.8JUhq-FtthfU-lhYJT9FhFdyPgTCzHP0jFZIdeKlxdw&dib_tag=se&keywords=caisse+a+outil&qid=1750956569&sprefix=caiss%2Caps%2C76&sr=8-5-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
			},
			{
				title: "Outil Montage Roulements Vilebrequin",
				logo: "logo2.png",
				alt: "Outil Montage Roulements Vilebrequin",
				price: config[0]?.montageRoulement || 'N/A',
				image: "montageRoulement.png",
				configKey: "https://www.amazon.fr/Easyboost-Crankshaft-Bearing-Mounting-Booster/dp/B07N2Y56S2/ref=sr_1_3_sspa?crid=1OFF8ZNJ992PZ&dib=eyJ2IjoiMSJ9.kD7w6zmIK8PvIbws_srZnwjUJnLlUemMVAWvsFBmzAXHApd6HdRA3BDwDS3S_Ok701PxAP-8kGuypBu_b9bSJ0IQbKCujcJ_6Sg1njh2UirGXDI-1xqOHXgut3vF4cuwOhsYazhwg45iE6Zu8_Y_HSPSQ5t3MFWsk9O3M_oLlX8CxBs9bVcxL41S5RjNqk_II-cJnQbdQdpppk9GxOrVLSxyTlfPjv5suWVh8h6cKMeShoWlUn1kgDnKM1F1lzddIT771eNQbbAaMhjM6zK7zOoH59eHiFToq4ga9MSKiMc.tUk0iXqXQHriwUb6PSQj_KMdAhBY-vgEUjWqTT1PXPg&dib_tag=se&keywords=montage+roulement&qid=1750956532&sprefix=montage+roulement%2Caps%2C59&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
			},
			{
				title: "Extracteur de Roulement",
				logo: "logo2.png",
				alt: "Extracteur de Roulement",
				price: config[0]?.extracteur || 'N/A',
				image: "extracteur.png",
				configKey: "https://www.amazon.fr/-/en/Bearing-Puller-Detachment-Maintenance-Motorcycle/dp/B0CQY3Z7KX/ref=sr_1_14?crid=39GG5OTQRW918&dib=eyJ2IjoiMSJ9.DPfsmub2XGV3QCWZqeSVRr5M5WmqPV3KLxCTCamE6CRQeoeFw2EaOSjHUZTmYZKn3WiOat969scCSF-XLnlsEIMNUApsyVCpehRfPE6dLDD4bTBGnZBlnKdRef7yynKZLI5YAfZYdf_blIsRoACXHyhexlaX6vp5r-M9EXVr658FcFAxX78YJu9CY6SmFoz9-LOLtm79Fu0rxePLCNHWG9OXJ_ZMH2h3ruUEJLJBD7WeSiHnOF2y_1V2KyjdclKxTdUTkra4ySASn5YdqmwRgConCHJwS5-5hY0dAW0FD8M.4R-UlDku7S_UGcJ3JlEzrf-xqBftKRHFU8IVm3Wckdk&dib_tag=se&keywords=arrache+roulement&qid=1750956452&sprefix=arrac%2Caps%2C77&sr=8-14"
			},
			{
				title: "Extracteur de Roulement 4PCs",
				logo: "logo2.png",
				alt: "Extracteur de Roulement 4PCs",
				price: config[0]?.branche3 || 'N/A',
				image: "troisBranche.png",
				configKey: "https://www.amazon.fr/-/en/Bearing-Opening-Maintenance-Disassembly-Machines/dp/B0CF15TMFY/ref=sr_1_7?crid=39GG5OTQRW918&dib=eyJ2IjoiMSJ9.DPfsmub2XGV3QCWZqeSVRr5M5WmqPV3KLxCTCamE6CRQeoeFw2EaOSjHUZTmYZKn3WiOat969scCSF-XLnlsEIMNUApsyVCpehRfPE6dLDD4bTBGnZBlnKdRef7yynKZLI5YAfZYdf_blIsRoACXHyhexlaX6vp5r-M9EXVr658FcFAxX78YJu9CY6SmFoz9-LOLtm79Fu0rxePLCNHWG9OXJ_ZMH2h3ruUEJLJBD7WeSiHnOF2y_1V2KyjdclKxTdUTkra4ySASn5YdqmwRgConCHJwS5-5hY0dAW0FD8M.4R-UlDku7S_UGcJ3JlEzrf-xqBftKRHFU8IVm3Wckdk&dib_tag=se&keywords=arrache+roulement&qid=1750956452&sprefix=arrac%2Caps%2C77&sr=8-7"
			},
			{
				title: "Extracteurs de roulements",
				logo: "logo2.png",
				alt: "Extracteurs de roulements",
				price: config[0]?.dayuan || 'N/A',
				image: "dayuan.png",
				configKey: "https://www.amazon.fr/DAYUAN-Bearing-Separator-Sprocket-30-70mm/dp/B07T49N6NY/ref=sr_1_4_sspa?crid=39GG5OTQRW918&dib=eyJ2IjoiMSJ9.DPfsmub2XGV3QCWZqeSVRr5M5WmqPV3KLxCTCamE6CRQeoeFw2EaOSjHUZTmYZKn3WiOat969scCSF-XLnlsEIMNUApsyVCpehRfPE6dLDD4bTBGnZBlnKdRef7yynKZLI5YAfZYdf_blIsRoACXHyhexlaX6vp5r-M9EXVr658FcFAxX78YJu9CY6SmFoz9-LOLtm79Fu0rxePLCNHWG9OXJ_ZMH2h3ruUEJLJBD7WeSiHnOF2y_1V2KyjdclKxTdUTkra4ySASn5YdqmwRgConCHJwS5-5hY0dAW0FD8M.4R-UlDku7S_UGcJ3JlEzrf-xqBftKRHFU8IVm3Wckdk&dib_tag=se&keywords=arrache%2Broulement&qid=1750956452&sprefix=arrac%2Caps%2C77&sr=8-4-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1"
			},
			{
				title: "Arrache à inertie",
				logo: "logo2.png",
				alt: "Arrache à inertie",
				price: config[0]?.inertie || 'N/A',
				image: "inertie.png",
				configKey: "https://www.amazon.fr/XSTARYE-Bicycle-Bearing-Motorcycle-Expansion/dp/B0DZD1FP2H/ref=sr_1_2_sspa?crid=39GG5OTQRW918&dib=eyJ2IjoiMSJ9.DPfsmub2XGV3QCWZqeSVRr5M5WmqPV3KLxCTCamE6CRQeoeFw2EaOSjHUZTmYZKn3WiOat969scCSF-XLnlsEIMNUApsyVCpehRfPE6dLDD4bTBGnZBlnKdRef7yynKZLI5YAfZYdf_blIsRoACXHyhexlaX6vp5r-M9EXVr658FcFAxX78YJu9CY6SmFoz9-LOLtm79Fu0rxePLCNHWG9OXJ_ZMH2h3ruUEJLJBD7WeSiHnOF2y_1V2KyjdclKxTdUTkra4ySASn5YdqmwRgConCHJwS5-5hY0dAW0FD8M.4R-UlDku7S_UGcJ3JlEzrf-xqBftKRHFU8IVm3Wckdk&dib_tag=se&keywords=arrache+roulement&qid=1750956452&sprefix=arrac%2Caps%2C77&sr=8-2-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
			},
		]
	}
];
