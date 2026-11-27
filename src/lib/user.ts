/** The first visible character of a display name, used in avatar fallbacks. */
export function firstLetter(name: string): string {
	const [first] = Array.from(name.trim());
	return first?.toUpperCase() ?? "?";
}
