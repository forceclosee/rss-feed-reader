import type { FeedFetcher } from "./fetch";
import { ingestFeed } from "./ingest";
import { STARTER_PACK } from "./starter-pack";
import { type FeedStore, markFeedError, persistIngestedFeed } from "./store";

export interface SeedFailure {
	url: string;
	error: string;
}

export interface SeedResult {
	feeds: number;
	items: number;
	failures: SeedFailure[];
}

export interface SeedOptions {
	now?: Date;
}

/**
 * Fetches and ingests every Starter Pack Feed. Persistence is idempotent, so
 * running this again updates existing Feeds and Items instead of duplicating
 * them. One dead Feed does not stop the rest of the pack.
 */
export async function seedStarterPack(
	store: FeedStore,
	fetcher: FeedFetcher,
	options: SeedOptions = {},
): Promise<SeedResult> {
	const now = options.now ?? new Date();
	const failures: SeedFailure[] = [];
	let feeds = 0;
	let items = 0;

	for (const category of STARTER_PACK) {
		for (const feed of category.feeds) {
			try {
				const fetched = await fetcher(feed.feedUrl);
				const ingested = ingestFeed(fetched, {
					fallbackTitle: feed.title,
					fallbackSiteUrl: feed.siteUrl,
					fallbackDescription: feed.description,
				});
				const result = await persistIngestedFeed(store, ingested, { now });

				feeds += 1;
				items += result.itemCount;
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				failures.push({ url: feed.feedUrl, error: message });

				await markFeedError(
					store,
					{
						url: feed.feedUrl,
						title: feed.title,
						siteUrl: feed.siteUrl,
						description: feed.description,
					},
					message,
					{ now },
				);
			}
		}
	}

	return { feeds, items, failures };
}
