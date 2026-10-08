export interface FoundItem {
	source: string
	itemId: string
	title: string
	priceCents: number | undefined
	currency: string
	url: string
	imageUrl: string | undefined
	condition: string | undefined
}

export interface SearchQuery {
	query: string
	reference: string | undefined
	maxPriceCents: number | undefined
}

export interface Source {
	readonly name: string
	search(query: SearchQuery): Promise<Array<FoundItem>>
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export class SourceError extends Error {
	readonly retryable: boolean
	readonly budgetExhausted: boolean

	constructor(message: string, options: { retryable?: boolean; budgetExhausted?: boolean } = {}) {
		super(message)
		this.name = 'SourceError'
		this.retryable = options.retryable ?? false
		this.budgetExhausted = options.budgetExhausted ?? false
	}
}

export function withinPrice(item: Pick<FoundItem, 'priceCents'>, maxPriceCents: number | undefined): boolean {
	return maxPriceCents === undefined || (item.priceCents !== undefined && item.priceCents <= maxPriceCents)
}
