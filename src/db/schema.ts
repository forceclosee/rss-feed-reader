import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const feeds = pgTable(
	"feeds",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		url: text("url").notNull().unique(),
		siteUrl: text("site_url"),
		title: text("title"),
		description: text("description"),
		iconUrl: text("icon_url"),
		format: text("format"),
		etag: text("etag"),
		lastModified: text("last_modified"),
		lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
		lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
		lastError: text("last_error"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index("feeds_last_fetched_at_idx").on(table.lastFetchedAt)],
);

export const items = pgTable(
	"items",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		feedId: uuid("feed_id")
			.notNull()
			.references(() => feeds.id, { onDelete: "cascade" }),
		guid: text("guid").notNull(),
		url: text("url"),
		title: text("title").notNull(),
		author: text("author"),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		contentHtml: text("content_html"),
		plainText: text("plain_text"),
		excerpt: text("excerpt"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("items_feed_guid_idx").on(table.feedId, table.guid),
		index("items_feed_published_idx").on(table.feedId, table.publishedAt),
		index("items_published_at_idx").on(table.publishedAt),
	],
);

export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
