import { config } from 'libs/donner';

export const categories = [
	{
		products: [
			{
				title: "protege",
				logo: "logo2.png",
				alt: "Maître cylindre Adelin anodisé",
				price: config[0]?.mcAdelin || 'N/A',
				image: "mcAdelin.png",
				configKey: "https://www.amazon.fr/-/en/AXH16101942/dp/B0FDG3ZM8W/ref=sr_1_12?crid=7IKGLJUESFQA&dib=eyJ2IjoiMSJ9.0vk_LMwh6LppXHubwKYqKvXVui4QxHdlBIQx4cVH4QJDE75mmhz8EEtEjdX6FyQ7R3phN0uapESqu1PWjjQrbW73Tq9DVDsmERLzfSTS9QDxQw1_ZXuZHE-QdVcpCJ5fNxRzstpPMkx5UI01o82FD57g5xxExRTF0-WKUdoPfRa3ShWzLk8zAYhmUliNinC9qgrhu9ALT7_JfCFVYLMtyZW3JKBqW7nC1Ku1_Z6zVOH9owFiaG5B3sQCxYB1KFRuMI8_X28HtLa2X8CrOQGgfi6zJej0MpMWLhr3K7PtTxg.muKfBXo0mGOxtgX5NCGNy1QzpRBE-NtI-t0OvYGSYHg&dib_tag=se&keywords=disque%2Bgradu%C3%A9%2B360&qid=1750956118&sprefix=disque%2Bgradu%C3%A9%2B360%2B%2Caps%2C66&sr=8-12&th=1"
			},
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo2.png",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: ""
			},
			{
				title: "Nettoyant pour Pots TTP - 120ml",
				logo: "logo2.png",
				alt: "Nettoyant TTP",
				price: config[0]?.clearPot || 'N/A',
				image: "flacon.png",
				configKey: ""
			},
		]
	}
]
