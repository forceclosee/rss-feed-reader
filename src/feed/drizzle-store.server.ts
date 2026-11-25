import { eq, sql } from "drizzle-orm";
import type { Database } from "../db/client.server";
import { feeds, items } from "../db/schema";
import type { FeedStore, NewFeedValues, NewItemValues, StoredFeed } from "./store";

const ITEM_CHUNK_SIZE = 100;

export function createDrizzleFeedStore(db: Database): FeedStore {
	return {
		async findByUrl(url: string): Promise<StoredFeed | null> {
			const [feed] = await db.select().from(feeds).where(eq(feeds.url, url)).limit(1);
			return feed ?? null;
		},

		async insertFeed(values: NewFeedValues): Promise<StoredFeed> {
			const [feed] = await db
				.insert(feeds)
				.values({ ...values, updatedAt: new Date() })
				.returning();

			if (!feed) throw new Error("The Feed could not be inserted.");
			return feed;
		},

		async updateFeed(id: string, values: Partial<NewFeedValues>): Promise<void> {
			await db
				.update(feeds)
				.set({ ...values, updatedAt: new Date() })
				.where(eq(feeds.id, id));
		},

		async deleteFeed(id: string): Promise<void> {
			await db.delete(feeds).where(eq(feeds.id, id));
		},

		async upsertItems(feedId: string, values: NewItemValues[]): Promise<void> {
			for (let index = 0; index < values.length; index += ITEM_CHUNK_SIZE) {
				const chunk = values.slice(index, index + ITEM_CHUNK_SIZE);
				if (chunk.length === 0) continue;

				await db
					.insert(items)
					.values(chunk.map((item) => ({ ...item, feedId })))
					.onConflictDoUpdate({
						target: [items.feedId, items.guid],
						set: {
							url: sql`excluded.url`,
							title: sql`excluded.title`,
							author: sql`excluded.author`,
							publishedAt: sql`excluded.published_at`,
							contentHtml: sql`excluded.content_html`,
							plainText: sql`excluded.plain_text`,
							excerpt: sql`excluded.excerpt`,
							updatedAt: new Date(),
						},
					});
			}
		},
	};
}
