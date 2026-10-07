import { type CtResult, buildIcs, computeCt, countdownText, formatLong, formatShort, googleCalendarUrl, outlookCalendarUrl, parseIsoDate, reminderFor, todayUtc } from 'libs/controleTechnique'

type Echeance = Extract<CtResult, { kind: 'echeance' }>

const STATUS_LABEL = { retard: 'En retard', proche: 'Bientôt', ok: 'À jour' } as const

function pick<T extends Element>(root: ParentNode, selector: string): T {
	const element = root.querySelector<T>(selector)
	if (!element) throw new Error(`Élément introuvable : ${selector}`)
	return element
}

function slug(value: string): string {
	return (
		value
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || '2-roues'
	)
}

function timelineItems(result: CtResult): Array<{ date: Date; text: string; main?: boolean; estimate?: boolean }> {
	if (result.kind !== 'echeance') return []
	return [
		...(result.opens ? [{ date: result.opens, text: 'Ouverture de la période de contrôle' }] : []),
		{ date: result.deadline, text: result.source === 'premier' ? 'Date limite du premier contrôle' : 'Date limite du prochain contrôle', main: true },
		{ date: result.next[0] as Date, text: 'Renouvellement suivant', estimate: true },
		{ date: result.next[1] as Date, text: 'Renouvellement d’après', estimate: true }
	]
}

function hintFor(result: Echeance, today: Date): string | undefined {
	if (result.status === 'retard' && result.source === 'premier') {
		return 'Déjà passé au contrôle ? Indiquez la date du dernier contrôle favorable pour obtenir la prochaine échéance. Sinon, prenez rendez-vous vite : l’amende est de 135 € et le véhicule peut être immobilisé.'
	}
	if (result.status === 'retard') return 'Prenez rendez-vous vite : l’amende est de 135 € et le véhicule peut être immobilisé.'
	if (result.opens && result.opens > today) return `Vous pourrez le passer à partir du ${formatLong(result.opens)}.`
	return undefined
}

function labelFor(result: CtResult): string {
	switch (result.kind) {
		case 'echeance': {
			if (result.status === 'retard') return 'Échéance dépassée'
			return result.source === 'renouvellement' ? 'Contrôle valable jusqu’au' : 'Premier contrôle avant le'
		}
		case 'dispense':
			return 'Aucun contrôle'
		case 'erreur':
			return 'Vérifiez les dates'
		default:
			return 'Votre échéance'
	}
}

function ruleFor(result: CtResult): string {
	switch (result.kind) {
		case 'vide':
			return 'Saisissez la date de la case B pour obtenir votre date limite.'
		case 'erreur':
			return result.message
		default:
			return result.rule
	}
}

function init(root: ParentNode) {
	const form = root.querySelector<HTMLFormElement>('[data-ct-form]')
	if (!form || form.dataset.ready) return
	form.dataset.ready = 'true'

	const panel = pick<HTMLElement>(root, '[data-ct-result]')
	const ui = {
		immat: pick<HTMLInputElement>(form, '#ct-immat'),
		dernier: pick<HTMLInputElement>(form, '#ct-dernier'),
		collection: pick<HTMLInputElement>(form, '#ct-collection'),
		nom: pick<HTMLInputElement>(form, '#ct-nom'),
		label: pick<HTMLElement>(panel, '[data-ct-label]'),
		chip: pick<HTMLElement>(panel, '[data-ct-chip]'),
		date: pick<HTMLElement>(panel, '[data-ct-date]'),
		count: pick<HTMLElement>(panel, '[data-ct-count]'),
		rule: pick<HTMLElement>(panel, '[data-ct-rule]'),
		hint: pick<HTMLElement>(panel, '[data-ct-hint]'),
		actions: pick<HTMLElement>(panel, '[data-ct-actions]'),
		google: pick<HTMLAnchorElement>(panel, '[data-ct-google]'),
		outlook: pick<HTMLAnchorElement>(panel, '[data-ct-outlook]'),
		ics: pick<HTMLButtonElement>(panel, '[data-ct-ics]'),
		note: pick<HTMLElement>(panel, '[data-ct-note]'),
		timeline: pick<HTMLOListElement>(root, '[data-ct-timeline]')
	}

	let current: { result: CtResult; name: string; today: Date } | undefined

	const renderTimeline = (result: CtResult, today: Date) => {
		ui.timeline.replaceChildren()
		const items = timelineItems(result)
		if (!items.length) {
			const li = document.createElement('li')
			li.className = 'text-gray-500'
			li.textContent = result.kind === 'dispense' ? 'Aucune échéance : véhicule dispensé.' : 'Les échéances s’affichent dès que la date de la case B est saisie.'
			ui.timeline.append(li)
			return
		}
		for (const item of items) {
			const li = document.createElement('li')
			li.className = `flex flex-wrap gap-x-4 gap-y-1 border-l-4 py-2 pl-4 ${item.main ? 'border-orange-500 font-semibold' : 'border-orange-200'} ${item.date < today ? 'text-gray-400' : ''}`
			const when = document.createElement('span')
			when.className = 'w-28 shrink-0 tabular-nums'
			when.textContent = formatShort(item.date)
			const what = document.createElement('span')
			what.textContent = item.estimate ? `${item.text} (estimé)` : item.text
			li.append(when, what)
			ui.timeline.append(li)
		}
	}

	const renderReminder = (result: Echeance, name: string, today: Date) => {
		const event = reminderFor(name, result, today)
		ui.google.href = googleCalendarUrl(event)
		ui.outlook.href = outlookCalendarUrl(event)
		ui.note.textContent =
			result.status === 'retard'
				? 'Le rappel est placé demain, le temps de prendre rendez-vous.'
				: 'Le rappel tombe 30 jours avant l’échéance. Le fichier .ics ajoute aussi des alertes à J-7 et le jour même.'
	}

	const render = () => {
		const today = todayUtc()
		const result = computeCt({ firstRegistration: parseIsoDate(ui.immat.value), lastInspection: parseIsoDate(ui.dernier.value), collection: ui.collection.checked }, today)
		const name = ui.nom.value.trim()
		current = { result, name, today }
		const echeance = result.kind === 'echeance' ? result : undefined
		const hint = echeance ? hintFor(echeance, today) : undefined

		panel.dataset.status = echeance?.status ?? 'neutre'
		ui.label.textContent = labelFor(result)
		ui.rule.textContent = ruleFor(result)
		ui.date.textContent = echeance ? formatLong(echeance.deadline) : result.kind === 'dispense' ? 'Dispensé' : '—'
		ui.count.textContent = echeance ? countdownText(echeance.days) : ''
		ui.chip.textContent = echeance ? STATUS_LABEL[echeance.status] : ''
		ui.chip.hidden = !echeance
		ui.hint.textContent = hint ?? ''
		ui.hint.hidden = !hint
		ui.actions.hidden = !echeance
		if (echeance) renderReminder(echeance, name, today)
		renderTimeline(result, today)
	}

	ui.ics.addEventListener('click', () => {
		if (current?.result.kind !== 'echeance') return
		const blob = new Blob([buildIcs(current.name, current.result, current.today)], { type: 'text/calendar;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `rappel-ct-${slug(current.name)}.ics`
		document.body.append(link)
		link.click()
		link.remove()
		setTimeout(() => URL.revokeObjectURL(url), 4000)
	})

	form.addEventListener('submit', (event) => event.preventDefault())
	form.addEventListener('input', render)
	form.addEventListener('change', render)
	render()
}

const boot = () => init(document)
document.addEventListener('astro:page-load', boot)
if (document.readyState !== 'loading') boot()
else document.addEventListener('DOMContentLoaded', boot)
