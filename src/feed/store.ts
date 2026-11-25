import type { IngestedFeed, IngestedItem } from "./ingest";
import { faviconFor } from "./url";

export interface StoredFeed {
	id: string;
	url: string;
	siteUrl: string | null;
	title: string | null;
	description: string | null;
	iconUrl: string | null;
	format: string | null;
	etag: string | null;
	lastModified: string | null;
	lastFetchedAt: Date | null;
	lastSuccessAt: Date | null;
	lastError: string | null;
}

export interface NewFeedValues {
	url: string;
	siteUrl?: string | null;
	title?: string | null;
	description?: string | null;
	iconUrl?: string | null;
	format?: string | null;
	etag?: string | null;
	lastModified?: string | null;
	lastFetchedAt?: Date | null;
	lastSuccessAt?: Date | null;
	lastError?: string | null;
}

export interface NewItemValues {
	guid: string;
	url: string | null;
	title: string;
	author: string | null;
	publishedAt: Date | null;
	contentHtml: string | null;
	plainText: string | null;
	excerpt: string | null;
}

export interface FeedStore {
	findByUrl(url: string): Promise<StoredFeed | null>;
	insertFeed(values: NewFeedValues): Promise<StoredFeed>;
	updateFeed(id: string, values: Partial<NewFeedValues>): Promise<void>;
	deleteFeed(id: string): Promise<void>;
	upsertItems(feedId: string, values: NewItemValues[]): Promise<void>;
}

export interface PersistResult {
	feedId: string;
	created: boolean;
	itemCount: number;
}

export interface PersistOptions {
	now?: Date;
}

/**
 * Persists a normalized Feed and its Items. Feed identity is the canonical
 * URL; Item identity is (feedId, guid), so re-ingest updates instead of
 * duplicating.
 */
export async function persistIngestedFeed(
	store: FeedStore,
	ingested: IngestedFeed,
	options: PersistOptions = {},
): Promise<PersistResult> {
	const now = options.now ?? new Date();
	const requestedUrl = ingested.feed.requestedUrl;
	const finalUrl = ingested.feed.url;
	const existing = await store.findByUrl(requestedUrl);
	const finalExisting = finalUrl !== requestedUrl ? await store.findByUrl(finalUrl) : null;
	const feed = existing ?? finalExisting;

	const canonicalUrl = ingested.feed.permanentRedirect ? finalUrl : requestedUrl;
	const values: NewFeedValues = {
		url: canonicalUrl,
		siteUrl: ingested.feed.siteUrl,
		title: ingested.feed.title,
		description: ingested.feed.description,
		iconUrl: ingested.feed.iconUrl,
		format: ingested.feed.format,
		etag: ingested.feed.etag,
		lastModified: ingested.feed.lastModified,
		lastFetchedAt: now,
		lastSuccessAt: now,
		lastError: null,
	};

	let feedId: string;
	let created = false;

	if (existing && finalExisting && existing.id !== finalExisting.id) {
		// A permanent redirect now points at a Feed already cached under its
		// canonical URL. Merge into that row so one URL is not fetched twice.
		feedId = finalExisting.id;
		await store.deleteFeed(existing.id);
		await store.updateFeed(feedId, { ...values, url: finalExisting.url });
	} else if (!feed) {
		const inserted = await store.insertFeed(values);
		feedId = inserted.id;
		created = true;
	} else {
		feedId = feed.id;

		const shouldAdoptFinalUrl =
			existing !== null &&
			ingested.feed.permanentRedirect &&
			finalUrl !== existing.url &&
			finalExisting === null;

		await store.updateFeed(feedId, {
			...values,
			url: shouldAdoptFinalUrl ? finalUrl : feed.url,
		});
	}

	await store.upsertItems(feedId, ingested.items.map(toItemValues));

	return { feedId, created, itemCount: ingested.items.length };
}

export interface FeedTarget {
	url: string;
	title?: string;
	siteUrl?: string;
	description?: string;
}

/**
 * Records a failed fetch without discarding the last successful fetch time.
 * A never-seen Feed is created as a placeholder so it stays visible in the
 * Starter Pack while its error is surfaced.
 */
export async function markFeedError(
	store: FeedStore,
	target: FeedTarget,
	message: string,
	options: PersistOptions = {},
): Promise<void> {
	const now = options.now ?? new Date();
	const existing = await store.findByUrl(target.url);

	if (existing) {
		await store.updateFeed(existing.id, {
			lastFetchedAt: now,
			lastError: message,
		});
		return;
	}

	await store.insertFeed({
		url: target.url,
		siteUrl: target.siteUrl ?? null,
		title: target.title ?? null,
		description: target.description ?? null,
		iconUrl: faviconFor(target.siteUrl),
		format: null,
		etag: null,
		lastModified: null,
		lastFetchedAt: now,
		lastSuccessAt: null,
		lastError: message,
	});
}

function toItemValues(item: IngestedItem): NewItemValues {
	return {
		guid: item.guid,
		url: item.url,
		title: item.title,
		author: item.author,
		publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
		contentHtml: item.contentHtml,
		plainText: item.plainText,
		excerpt: item.excerpt,
	};
}
