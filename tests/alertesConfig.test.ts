import { describe, expect, test } from 'vitest'
import { loadConfig } from '../src/alerts/config'
import { RUN_TOKEN, SECRET } from './support/alertes'

const CLIENT_SECRET = 'PRD-0123456789ab-cdef-0123-4567-89ab'

const BASE: Record<string, string> = Object.fromEntries([
	['ALERTS_ENABLED', 'true'],
	['ALERTS_SECRET', SECRET],
	['ALERTS_RUN_TOKEN', RUN_TOKEN],
	['SMTP_URL', 'smtps://user:motdepasse@smtp.exemple.fr:465'],
	['MAIL_FROM', 'Trouve ta pièce <alertes@trouve-ta-piece.fr>'],
	['MAIL_POSTAL_ADDRESS', 'Trouve ta pièce, 26 boulevard Robert Schuman, 44300 Nantes'],
	['EBAY_ENABLED', 'true'],
	['EBAY_CLIENT_ID', 'LucasLie-ttp-PRD-0123456789-abcdef01'],
	['EBAY_CLIENT_SECRET', CLIENT_SECRET],
	['EBAY_CAMPAIGN_ID', '5338123456']
])

const FEED = { name: 'muc-off', url: 'https://feeds.exemple.com/muc-off.csv?token=abc', columns: { title: 'Product Name', url: 'Product URL', price: 'Price' } }

const env = (...pairs: Array<[string, string]>): Record<string, string> => ({ ...BASE, ...Object.fromEntries(pairs) })

const reasonOf = (env: Record<string, string | undefined>) => {
	const result = loadConfig(env)
	return result.enabled ? 'actif' : result.reason
}

describe('configuration', () => {
	test('désactivé par défaut', () => {
		expect(loadConfig({}).enabled).toBe(false)
		expect(loadConfig(env(['ALERTS_ENABLED', '1'])).enabled).toBe(false)
	})

	test('configuration eBay complète', () => {
		const result = loadConfig(BASE)
		expect(result.enabled).toBe(true)
		if (!result.enabled) return
		expect(result.config.siteUrl).toBe('https://trouve-ta-piece.fr')
		expect(result.config.ebay).toMatchObject({ marketplace: 'EBAY_FR', apiBase: 'https://api.ebay.com', dailyBudget: 4000, campaignId: '5338123456' })
		expect(result.config.dbPath).toBe('./data/alertes.sqlite')
		expect(result.config.trustProxy).toBe(false)
	})

	test('secrets obligatoires et distincts', () => {
		expect(reasonOf(env(['ALERTS_SECRET', 'court']))).toContain('ALERTS_SECRET')
		expect(reasonOf(env(['ALERTS_RUN_TOKEN', 'court']))).toContain('ALERTS_RUN_TOKEN')
		expect(reasonOf(env(['ALERTS_RUN_TOKEN', SECRET]))).toContain('ALERTS_RUN_TOKEN')
	})

	test('URL du site et SMTP', () => {
		expect(reasonOf(env(['SITE_URL', 'http://trouve-ta-piece.fr']))).toContain('SITE_URL')
		expect(reasonOf(env(['SITE_URL', 'https://trouve-ta-piece.fr/?x=1']))).toContain('SITE_URL')
		expect(reasonOf(env(['SITE_URL', 'http://localhost:4321/']))).toBe('actif')
		expect(reasonOf(env(['SMTP_URL', 'http://smtp.exemple.fr']))).toContain('SMTP_URL')
		expect(reasonOf(env(['MAIL_FROM', 'alertes@trouve-ta-piece.fr\r\nBcc: x@y.fr']))).toContain('MAIL_FROM')
		expect(reasonOf(env(['MAIL_FROM', 'pas une adresse']))).toContain('MAIL_FROM')
	})

	test('paramètres eBay contrôlés', () => {
		expect(reasonOf(env(['EBAY_CAMPAIGN_ID', '123']))).toContain('EBAY_CAMPAIGN_ID')
		expect(reasonOf(env(['EBAY_CLIENT_SECRET', 'a b']))).toContain('EBAY_CLIENT')
		expect(reasonOf(env(['EBAY_MARKETPLACE', 'FR']))).toContain('EBAY_MARKETPLACE')
		expect(reasonOf(env(['EBAY_API_BASE', 'http://api.ebay.com']))).toContain('EBAY_API_BASE')
		expect(reasonOf(env(['EBAY_API_BASE', 'http://127.0.0.1:9999']))).toBe('actif')
		expect(reasonOf(env(['EBAY_DAILY_BUDGET', '6000']))).toContain('EBAY_DAILY_BUDGET')
		expect(reasonOf(env(['EBAY_DAILY_BUDGET', '1e3']))).toContain('EBAY_DAILY_BUDGET')
		expect(reasonOf(env(['EBAY_CATEGORY_ID', 'abc']))).toContain('EBAY_CATEGORY_ID')
	})

	test('au moins une source', () => {
		expect(reasonOf(env(['EBAY_ENABLED', 'false']))).toContain('aucune source')
		expect(reasonOf(env(['EBAY_ENABLED', 'false'], ['FEEDS', JSON.stringify([FEED])]))).toBe('actif')
	})

	test('flux d’affiliation validés', () => {
		const withFeeds = (feeds: unknown) => reasonOf(env(['EBAY_ENABLED', 'false'], ['FEEDS', typeof feeds === 'string' ? feeds : JSON.stringify(feeds)]))
		expect(withFeeds('pas du json')).toContain('FEEDS')
		expect(withFeeds({ ...FEED })).toContain('tableau')
		expect(withFeeds([{ ...FEED, url: 'http://feeds.exemple.com/a.csv' }])).toContain('https')
		expect(withFeeds([{ ...FEED, url: 'https://user:pass@feeds.exemple.com/a.csv' }])).toContain('https')
		expect(withFeeds([{ ...FEED, name: 'ebay' }])).toContain('name')
		expect(withFeeds([{ ...FEED, name: 'Muc Off' }])).toContain('name')
		expect(withFeeds([FEED, FEED])).toContain('double')
		expect(withFeeds([{ ...FEED, delimiter: 'x' }])).toContain('delimiter')
		expect(withFeeds([{ ...FEED, columns: { title: 'Product Name' } }])).toContain('title et url')
		expect(withFeeds(Array.from({ length: 21 }, (_, i) => ({ ...FEED, name: `flux-${i}` })))).toContain('20')
	})

	test('les messages d’erreur ne révèlent jamais les secrets', () => {
		const leaky = [env(['EBAY_CAMPAIGN_ID', 'x']), env(['SMTP_URL', 'ftp://user:motdepasse@x']), env(['ALERTS_RUN_TOKEN', 'abc'])]
		for (const env of leaky) {
			const reason = reasonOf(env)
			expect(reason).not.toContain(SECRET)
			expect(reason).not.toContain('motdepasse')
			expect(reason).not.toContain(CLIENT_SECRET)
		}
	})
})
