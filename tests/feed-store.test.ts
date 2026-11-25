import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { type FetchedFeed, ingestFeed } from "#/feed/ingest";
import { markFeedError, persistIngestedFeed } from "#/feed/store";
import { MemoryFeedStore } from "./memory-feed-store";

const fixture = (name: string) => join(process.cwd(), "tests", "fixtures", name);

function fetched(name: string, overrides: Partial<FetchedFeed> = {}): FetchedFeed {
	const url = `https://example.com/${name}`;

	return {
		requestedUrl: url,
		url,
		status: 200,
		ok: true,
		notModified: false,
		permanentRedirect: false,
		body: new Uint8Array(readFileSync(fixture(name))),
		contentType: "application/xml",
		etag: null,
		lastModified: null,
		...overrides,
	};
}

const now = new Date("2026-11-24T12:00:00.000Z");

describe("persistIngestedFeed", () => {
	it("stores a Feed and its Items once, and updates them on re-ingest without duplicates", async () => {
		const store = new MemoryFeedStore();
		const ingested = ingestFeed(fetched("rss2.xml"));

		const first = await persistIngestedFeed(store, ingested, { now });
		expect(first).toMatchObject({ created: true, itemCount: 3 });
		expect(store.feeds.size).toBe(1);
		expect(store.items.size).toBe(3);

		const second = await persistIngestedFeed(store, ingested, { now });
		expect(second).toMatchObject({ feedId: first.feedId, created: false, itemCount: 3 });
		expect(store.feeds.size).toBe(1);
		expect(store.items.size).toBe(3);
	});

	it("adopts the canonical URL after a permanent redirect", async () => {
		const store = new MemoryFeedStore();
		const ingested = ingestFeed(
			fetched("rss2.xml", {
				requestedUrl: "https://old.example/feed.xml",
				url: "https://new.example/feed.xml",
				permanentRedirect: true,
			}),
		);

		await persistIngestedFeed(store, ingested, { now });

		expect([...store.feeds.values()][0]?.url).toBe("https://new.example/feed.xml");

		await persistIngestedFeed(store, ingested, { now });
		expect(store.feeds.size).toBe(1);
	});

	it("keeps the requested URL after a temporary redirect", async () => {
		const store = new MemoryFeedStore();
		const ingested = ingestFeed(
			fetched("rss2.xml", {
				requestedUrl: "https://old.example/feed.xml",
				url: "https://mirror.example/feed.xml",
				permanentRedirect: false,
			}),
		);

		await persistIngestedFeed(store, ingested, { now });

		expect([...store.feeds.values()][0]?.url).toBe("https://old.example/feed.xml");
	});

	it("merges into an existing canonical Feed after a permanent redirect", async () => {
		const store = new MemoryFeedStore();
		const requestedUrl = "https://old.example/feed.xml";
		const finalUrl = "https://new.example/feed.xml";
		const canonical = await store.insertFeed({ url: finalUrl, title: "Canonical" });

		await persistIngestedFeed(
			store,
			ingestFeed(fetched("rss2.xml", { requestedUrl, url: requestedUrl })),
			{ now },
		);
		expect(store.feeds.size).toBe(2);

		const result = await persistIngestedFeed(
			store,
			ingestFeed(fetched("rss2.xml", { requestedUrl, url: finalUrl, permanentRedirect: true })),
			{ now },
		);

		expect(result.feedId).toBe(canonical.id);
		expect(store.feeds.size).toBe(1);
		expect([...store.feeds.values()][0]?.url).toBe(finalUrl);
		expect(store.items.size).toBe(3);
	});
});

describe("markFeedError", () => {
	it("records the failure while preserving the last successful fetch", async () => {
		const store = new MemoryFeedStore();
		const ingested = ingestFeed(fetched("rss2.xml"));
		const { feedId } = await persistIngestedFeed(store, ingested, { now });

		await markFeedError(
			store,
			{ url: ingested.feed.url, title: "Frontpage Test Feed & Friends" },
			"Timed out after 10 seconds",
			{ now: new Date("2026-11-24T13:00:00.000Z") },
		);

		const feed = await store.findByUrl(ingested.feed.url);
		expect(feed).toMatchObject({
			id: feedId,
			lastError: "Timed out after 10 seconds",
			lastSuccessAt: now,
			lastFetchedAt: new Date("2026-11-24T13:00:00.000Z"),
		});
	});

	it("creates a placeholder Feed for a source that has never been fetched", async () => {
		const store = new MemoryFeedStore();

		await markFeedError(
			store,
			{
				url: "https://dead.example/feed.xml",
				title: "Dead Feed",
				siteUrl: "https://dead.example/",
				description: "A dead source",
			},
			"HTTP 404",
			{ now },
		);

		expect(await store.findByUrl("https://dead.example/feed.xml")).toMatchObject({
			title: "Dead Feed",
			siteUrl: "https://dead.example/",
			description: "A dead source",
			lastError: "HTTP 404",
			lastSuccessAt: null,
		});
	});
});
