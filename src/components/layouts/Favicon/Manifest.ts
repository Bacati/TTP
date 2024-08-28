import { getImage } from 'astro:assets'

export default class Manifest {
	static async create(baseImage: ImageMetadata, options: {
		name: string
		color?: string
		images?: Array<number>
	}) {
		const [
			i192,
			i512
		] = await Promise.all([
			getImage({src: baseImage, format: 'png', width: 192, height: 192}),
			getImage({src: baseImage, format: 'png', width: 512, height: 512})
		])
		return JSON.stringify({
			name: options.name,
			short_name: options.name,
			icons: [
				{
					src: i192.src,
					sizes: "192x192",
					type: "image/png"
				},
				{
					src: i512.src,
					sizes: "512x512",
					type: "image/png"
				}
			],
			theme_color: options.color ?? "#fff",
			background_color: options.color ?? "#fff",
			display: "standalone"
		})
	}
}
