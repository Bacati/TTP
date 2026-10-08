import { signToken } from './tokens'

export interface Links {
	confirm(alertId: number, expiresAt: number): string
	manage(subscriberId: number): string
	unsubscribe(subscriberId: number): string
}

export function makeLinks(siteUrl: string, secret: string): Links {
	return {
		confirm: (alertId, expiresAt) => `${siteUrl}/alertes/confirmer?t=${signToken(secret, 'confirm', alertId, expiresAt)}`,
		manage: (subscriberId) => `${siteUrl}/alertes/gerer?t=${signToken(secret, 'sub', subscriberId, 0)}`,
		unsubscribe: (subscriberId) => `${siteUrl}/api/alertes/desinscription?t=${signToken(secret, 'sub', subscriberId, 0)}`
	}
}
