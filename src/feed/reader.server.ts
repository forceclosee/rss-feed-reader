import { desc, eq, sql } from "drizzle-orm";
import type { Database } from "../db/client.server";
import { feeds, items } from "../db/schema";
import type { ReaderItem } from "./reader";

export async function getReaderItems(db: Database, limit = 50): Promise<ReaderItem[]> {
	const rows = await db
		.select({
			id: items.id,
			title: items.title,
			url: items.url,
			author: items.author,
			publishedAt: items.publishedAt,
			excerpt: items.excerpt,
			plainText: items.plainText,
			feedId: feeds.id,
			feedTitle: feeds.title,
			feedSiteUrl: feeds.siteUrl,
			feedIconUrl: feeds.iconUrl,
		})
		.from(items)
		.innerJoin(feeds, eq(items.feedId, feeds.id))
		.orderBy(desc(sql`coalesce(${items.publishedAt}, ${items.createdAt})`), desc(items.createdAt))
		.limit(limit);

	return rows.map((row) => ({
		id: row.id,
		title: row.title,
		url: row.url,
		author: row.author,
		publishedAt: row.publishedAt?.toISOString() ?? null,
		excerpt: row.excerpt ?? row.plainText?.slice(0, 280) ?? null,
		feed: {
			id: row.feedId,
			title: row.feedTitle ?? "Untitled feed",
			siteUrl: row.feedSiteUrl,
			iconUrl: row.feedIconUrl,
		},
	}));
}
