import { describe, expect, test } from 'vitest'
import { merchantOf } from '../../src/libs/merchant'

describe('merchantOf', () => {
	test('liens Amazon (courts, link.amazon, amazon.fr)', () => {
		expect(merchantOf('https://amzn.to/4pRZuUW')).toBe('Amazon')
		expect(merchantOf('https://link.amazon/abc')).toBe('Amazon')
		expect(merchantOf('https://www.amazon.fr/dp/B000000000')).toBe('Amazon')
	})

	test('marchands connus', () => {
		expect(merchantOf('https://mucoff.sjv.io/c/123/456')).toBe('Muc-Off')
		expect(merchantOf('https://www.mycover-protection.com/fr/')).toBe('Mycover Protection')
		expect(merchantOf('https://flushfasteners.com/products/x')).toBe('Flush Fasteners')
	})

	test('hôte inconnu ou URL invalide', () => {
		expect(merchantOf('https://www.exemple-moto.fr/produit')).toBe('exemple-moto.fr')
		expect(merchantOf('pas une url')).toBe('le site du vendeur')
	})
})
