export type ReaderStatus = "ready" | "empty" | "unavailable";

export interface ReaderFeed {
	id: string;
	title: string;
	siteUrl: string | null;
	iconUrl: string | null;
}

export interface ReaderItem {
	id: string;
	title: string;
	url: string | null;
	author: string | null;
	publishedAt: string | null;
	excerpt: string | null;
	feed: ReaderFeed;
}

export function sortReaderItems(items: ReaderItem[]): ReaderItem[] {
	return [...items].sort(
		(first, second) => timestampOf(second.publishedAt) - timestampOf(first.publishedAt),
	);
}

function timestampOf(value: string | null): number {
	if (!value) return 0;

	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? 0 : timestamp;
}
