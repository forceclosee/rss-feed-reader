import type { FeedStore, NewFeedValues, NewItemValues, StoredFeed } from "#/feed/store";

type StoredItem = NewItemValues & { id: string; feedId: string };

export class MemoryFeedStore implements FeedStore {
	readonly feeds = new Map<string, StoredFeed>();
	readonly items = new Map<string, StoredItem>();
	private nextFeedId = 1;
	private nextItemId = 1;

	async findByUrl(url: string): Promise<StoredFeed | null> {
		for (const feed of this.feeds.values()) {
			if (feed.url === url) return feed;
		}
		return null;
	}

	async insertFeed(values: NewFeedValues): Promise<StoredFeed> {
		const id = `feed-${this.nextFeedId++}`;
		const feed: StoredFeed = {
			id,
			url: values.url,
			siteUrl: values.siteUrl ?? null,
			title: values.title ?? null,
			description: values.description ?? null,
			iconUrl: values.iconUrl ?? null,
			format: values.format ?? null,
			etag: values.etag ?? null,
			lastModified: values.lastModified ?? null,
			lastFetchedAt: values.lastFetchedAt ?? null,
			lastSuccessAt: values.lastSuccessAt ?? null,
			lastError: values.lastError ?? null,
		};
		this.feeds.set(id, feed);
		return feed;
	}

	async updateFeed(id: string, values: Partial<NewFeedValues>): Promise<void> {
		const feed = this.feeds.get(id);
		if (!feed) throw new Error(`Unknown feed ${id}`);
		this.feeds.set(id, { ...feed, ...values });
	}

	async deleteFeed(id: string): Promise<void> {
		this.feeds.delete(id);

		for (const [key, item] of this.items) {
			if (item.feedId === id) this.items.delete(key);
		}
	}

	async upsertItems(feedId: string, values: NewItemValues[]): Promise<void> {
		for (const item of values) {
			const key = `${feedId}:${item.guid}`;
			const existing = this.items.get(key);
			this.items.set(key, {
				...item,
				id: existing?.id ?? `item-${this.nextItemId++}`,
				feedId,
			});
		}
	}
}
