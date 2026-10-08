function readQuoted(text: string, start: number): { value: string; next: number } {
	let value = ''
	let index = start
	while (index < text.length) {
		const char = text[index] as string
		if (char === '"') {
			if (text[index + 1] !== '"') return { value, next: index + 1 }
			value += '"'
			index += 2
		} else {
			value += char
			index++
		}
	}
	return { value, next: index }
}

export function parseCsv(input: string, delimiter = ','): Array<Array<string>> {
	const text = input.startsWith('﻿') ? input.slice(1) : input
	const rows: Array<Array<string>> = []
	let row: Array<string> = []
	let cell = ''
	let index = 0

	const endRow = () => {
		row.push(cell)
		cell = ''
		if (!(row.length === 1 && row[0] === '')) rows.push(row)
		row = []
	}

	while (index < text.length) {
		const char = text[index] as string
		if (char === '"' && cell === '') {
			const quoted = readQuoted(text, index + 1)
			cell += quoted.value
			index = quoted.next
			continue
		}
		if (char === delimiter) {
			row.push(cell)
			cell = ''
		} else if (char === '\n' || char === '\r') {
			endRow()
			if (char === '\r' && text[index + 1] === '\n') index++
		} else {
			cell += char
		}
		index++
	}
	if (cell !== '' || row.length > 0) endRow()
	return rows
}

export function csvRecords(input: string, delimiter = ','): Array<Record<string, string>> {
	const [header, ...rows] = parseCsv(input, delimiter)
	if (!header) return []
	const names = header.map((name) => name.trim())
	return rows.map((cells) => {
		const record: Record<string, string> = Object.create(null)
		names.forEach((name, i) => {
			record[name] = (cells[i] ?? '').trim()
		})
		return record
	})
}
