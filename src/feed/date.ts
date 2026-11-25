const ISO_WITHOUT_ZONE = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_NAME_DATE = /^[A-Za-z]+ \d{1,2},? \d{4}$/;
const DAY_MONTH_YEAR_DATE = /^\d{1,2} [A-Za-z]+ \d{4}$/;
const RFC_822_WITHOUT_ZONE = /^[A-Za-z]{3},? \d{1,2} [A-Za-z]{3,} \d{4} \d{2}:\d{2}(?::\d{2})?$/;

function fromTimestamp(value: string): Date | null {
	if (!/^\d{10,13}$/.test(value)) return null;

	const timestamp = Number(value);
	const milliseconds = value.length === 10 ? timestamp * 1000 : timestamp;
	const date = new Date(milliseconds);

	return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Normalizes the date formats found in real RSS, Atom, and RDF feeds.
 * Dates without an explicit zone are treated as UTC so server and browser
 * render the same instant.
 */
export function parseFeedDate(value: unknown): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	if (typeof value !== "string" && typeof value !== "number") return null;

	const raw = String(value).trim();
	if (!raw) return null;

	const timestamp = fromTimestamp(raw);
	if (timestamp) return timestamp;

	if (ISO_WITHOUT_ZONE.test(raw)) {
		return validDate(Date.parse(`${raw.replace(" ", "T")}Z`));
	}

	if (DATE_ONLY.test(raw)) {
		return validDate(Date.parse(`${raw}T00:00:00Z`));
	}

	if (MONTH_NAME_DATE.test(raw) || DAY_MONTH_YEAR_DATE.test(raw)) {
		return validDate(Date.parse(`${raw} UTC`));
	}

	if (RFC_822_WITHOUT_ZONE.test(raw)) {
		return validDate(Date.parse(`${raw} GMT`));
	}

	const parsed = Date.parse(raw);
	return Number.isNaN(parsed) ? null : new Date(parsed);
}

function validDate(timestamp: number): Date | null {
	return Number.isNaN(timestamp) ? null : new Date(timestamp);
}
