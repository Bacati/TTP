/**
 * Filtres réels pour les grilles de catégorie.
 *
 * - masque/affiche les cartes (`hidden`) selon les cases cochées
 * - AND entre groupes (cylindrée / moteur / prix), OR à l'intérieur d'un groupe
 * - synchronise l'état dans l'URL (`?cc=70,80&engine=am6&price=500-700`)
 * - restaure l'état depuis l'URL au chargement
 * - met à jour le compteur de résultats + l'état « aucun résultat »
 *
 * Amélioration progressive : sans JS, toutes les cartes restent visibles.
 */

type Group = 'cc' | 'engines' | 'price'

const PARAM: Record<Group, string> = { cc: 'cc', engines: 'engine', price: 'price' }

function cardMatches(card: HTMLElement, selected: Record<Group, Set<string>>): boolean {
	for (const group of Object.keys(selected) as Array<Group>) {
		const wanted = selected[group]
		if (wanted.size === 0) continue
		const raw = (card.dataset[group] ?? '').toLowerCase()
		const values = group === 'engines' ? raw.split(',').filter(Boolean) : [raw].filter(Boolean)
		if (!values.some((v) => wanted.has(v))) return false
	}
	return true
}

function initGrid(root: ParentNode) {
	const bar = root.querySelector<HTMLFormElement>('[data-filter-bar]')
	const grid = root.querySelector<HTMLElement>('[data-product-grid]')
	if (!grid) return

	const cards = Array.from(grid.querySelectorAll<HTMLElement>('.card'))
	const countEl = grid.querySelector<HTMLElement>('[data-result-count]')
	const emptyEl = grid.querySelector<HTMLElement>('[data-empty-state]')
	const resetBtn = bar?.querySelector<HTMLButtonElement>('[data-filter-reset]')
	const boxes = bar ? Array.from(bar.querySelectorAll<HTMLInputElement>('input[data-filter]')) : []

	const readSelected = (): Record<Group, Set<string>> => {
		const sel: Record<Group, Set<string>> = { cc: new Set(), engines: new Set(), price: new Set() }
		for (const box of boxes) {
			if (!box.checked) continue
			const g = box.dataset.filter === 'engine' ? 'engines' : (box.dataset.filter as Group)
			sel[g].add(box.value.toLowerCase())
		}
		return sel
	}

	const syncUrl = (sel: Record<Group, Set<string>>) => {
		const url = new URL(window.location.href)
		for (const group of Object.keys(PARAM) as Array<Group>) {
			const values = [...sel[group]]
			if (values.length) url.searchParams.set(PARAM[group], values.join(','))
			else url.searchParams.delete(PARAM[group])
		}
		history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash)
	}

	const apply = (updateUrl = true) => {
		const sel = readSelected()
		let visible = 0
		for (const card of cards) {
			const show = cardMatches(card, sel)
			// `.card` porte `display:flex` (Tailwind) : l'attribut `hidden` ne suffit pas.
			card.style.display = show ? '' : 'none'
			if (show) visible++
		}
		if (countEl) countEl.textContent = String(visible)
		if (emptyEl) emptyEl.hidden = visible !== 0
		const anyActive = boxes.some((b) => b.checked)
		if (resetBtn) resetBtn.hidden = !anyActive
		if (updateUrl) syncUrl(sel)
	}

	// restaure depuis l'URL
	const params = new URL(window.location.href).searchParams
	for (const box of boxes) {
		const param = PARAM[box.dataset.filter === 'engine' ? 'engines' : (box.dataset.filter as Group)]
		const values = (params.get(param) ?? '').toLowerCase().split(',').filter(Boolean)
		if (values.includes(box.value.toLowerCase())) box.checked = true
	}

	for (const box of boxes) box.addEventListener('change', () => apply())
	resetBtn?.addEventListener('click', () => {
		for (const box of boxes) box.checked = false
		apply()
	})

	apply(false)
}

const boot = () => initGrid(document)
document.addEventListener('astro:page-load', boot)
if (document.readyState !== 'loading') boot()
else document.addEventListener('DOMContentLoaded', boot)
