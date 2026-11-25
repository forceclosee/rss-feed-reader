import sampleFeeds from "../../data/sample-feeds.json" with { type: "json" };

export interface StarterFeed {
	title: string;
	feedUrl: string;
	siteUrl: string;
	description: string;
	format: string;
}

export interface StarterCategory {
	name: string;
	feeds: StarterFeed[];
}

/**
 * The 19 curated Feeds across five Categories used by the Starter Pack.
 * `data/sample-feeds.json` remains the canonical source. Categories stay at
 * this layer until per-User Subscriptions exist in the shared schema.
 */
export const STARTER_PACK: StarterCategory[] = sampleFeeds.categories.map((category) => ({
	name: category.name,
	feeds: category.feeds.map((feed) => ({
		title: feed.title,
		feedUrl: feed.feedUrl,
		siteUrl: feed.siteUrl,
		description: feed.description,
		format: feed.format,
	})),
}));
