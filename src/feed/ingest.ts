import { FeedParseError } from "./errors";
import { parseFeed } from "./parse";
import { sanitizeFeedHtml, sanitizeFeedText } from "./sanitize";
import { faviconFor, hostnameOf, originOf } from "./url";

export interface FetchedFeed {
	requestedUrl: string;
	url: string;
	status: number;
	ok: boolean;
	notModified: boolean;
	permanentRedirect: boolean;
	body: Uint8Array | string | null;
	contentType: string | null;
	etag: string | null;
	lastModified: string | null;
}

export interface IngestOptions {
	fallbackTitle?: string;
	fallbackSiteUrl?: string;
	fallbackDescription?: string;
}

export interface IngestedItem {
	guid: string;
	url: string | null;
	title: string;
	author: string | null;
	publishedAt: string | null;
	contentHtml: string | null;
	plainText: string | null;
	excerpt: string | null;
}

export interface IngestedFeed {
	feed: {
		url: string;
		requestedUrl: string;
		permanentRedirect: boolean;
		siteUrl: string | null;
		title: string;
		description: string | null;
		iconUrl: string | null;
		format: string;
		etag: string | null;
		lastModified: string | null;
	};
	items: IngestedItem[];
}

/**
 * The shared ingestion boundary used by the Queue consumer, manual refresh,
 * and Starter Pack seeding. It normalizes a fetch result into Feed and Item
 * data that is safe to persist.
 */
export function ingestFeed(fetched: FetchedFeed, options: IngestOptions = {}): IngestedFeed {
	if (!fetched.body) {
		throw new FeedParseError("The feed response did not include a body.");
	}

	const parsed = parseFeed(fetched.body, {
		contentType: fetched.contentType,
		sourceUrl: fetched.url,
	});

	const siteUrl = parsed.siteUrl ?? options.fallbackSiteUrl ?? originOf(fetched.url);
	const title =
		sanitizeFeedText(parsed.title) ??
		options.fallbackTitle ??
		hostnameOf(fetched.url) ??
		"Untitled feed";
	const description = sanitizeFeedText(parsed.description) ?? options.fallbackDescription ?? null;
	const iconUrl = parsed.iconUrl ?? faviconFor(siteUrl);

	const seen = new Set<string>();
	const items: IngestedItem[] = [];

	for (const item of parsed.items) {
		if (seen.has(item.guid)) continue;
		seen.add(item.guid);

		const sanitized = sanitizeFeedHtml(item.contentHtml);
		items.push({
			guid: item.guid,
			url: item.url,
			title: sanitizeFeedText(item.title) ?? "Untitled",
			author: sanitizeFeedText(item.author),
			publishedAt: item.publishedAt?.toISOString() ?? null,
			contentHtml: sanitized.html,
			plainText: sanitized.plainText,
			excerpt: sanitized.excerpt,
		});
	}

	return {
		feed: {
			url: fetched.url,
			requestedUrl: fetched.requestedUrl,
			permanentRedirect: fetched.permanentRedirect,
			siteUrl,
			title,
			description,
			iconUrl,
			format: parsed.format,
			etag: fetched.etag,
			lastModified: fetched.lastModified,
		},
		items,
	};
}
