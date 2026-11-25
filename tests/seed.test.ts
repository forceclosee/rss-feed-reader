import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { FeedFetchError, type FeedFetcher } from "#/feed/fetch";
import type { FetchedFeed } from "#/feed/ingest";
import { seedStarterPack } from "#/feed/seed";
import { STARTER_PACK } from "#/feed/starter-pack";
import { MemoryFeedStore } from "./memory-feed-store";

const rss = new Uint8Array(readFileSync(join(process.cwd(), "tests", "fixtures", "rss2.xml")));

function fetcher(): FeedFetcher {
	return vi.fn(
		async (url: string): Promise<FetchedFeed> => ({
			requestedUrl: url,
			url,
			status: 200,
			ok: true,
			notModified: false,
			permanentRedirect: false,
			body: rss,
			contentType: "application/rss+xml",
			etag: null,
			lastModified: null,
		}),
	);
}

describe("STARTER_PACK", () => {
	it("contains 19 curated Feeds across five Categories", () => {
		expect(STARTER_PACK).toHaveLength(5);
		expect(STARTER_PACK.map((category) => category.name)).toEqual([
			"Frontend",
			"Design",
			"Backend & DevOps",
			"General Tech",
			"AI & ML",
		]);
		expect(STARTER_PACK.flatMap((category) => category.feeds)).toHaveLength(19);
	});
});

describe("seedStarterPack", () => {
	it("creates the Starter Pack once and is idempotent on re-run", async () => {
		const store = new MemoryFeedStore();
		const fetchFeed = fetcher();
		const now = new Date("2026-11-24T12:00:00.000Z");

		const first = await seedStarterPack(store, fetchFeed, { now });

		expect(first).toMatchObject({ feeds: 19, items: 57, failures: [] });
		expect(store.feeds.size).toBe(19);
		expect(store.items.size).toBe(57);
		expect(fetchFeed).toHaveBeenCalledTimes(19);

		const seededItem = [...store.items.values()][0];
		expect(seededItem).toMatchObject({
			title: "Hello — World ’24",
			publishedAt: new Date("2024-01-15T10:30:00.000Z"),
		});
		expect(seededItem?.excerpt).toContain("Full article");
		expect([...store.feeds.values()][0]?.iconUrl).toBe("https://example.com/icon.png");

		const second = await seedStarterPack(store, fetchFeed, { now });

		expect(second).toMatchObject({ feeds: 19, items: 57, failures: [] });
		expect(store.feeds.size).toBe(19);
		expect(store.items.size).toBe(57);
	});

	it("reports a dead Feed without stopping the rest of the Starter Pack", async () => {
		const store = new MemoryFeedStore();
		const base = fetcher();
		const fetchFeed: FeedFetcher = vi.fn(async (url: string) => {
			if (url === STARTER_PACK[0]?.feeds[0]?.feedUrl) {
				throw new FeedFetchError("HTTP 404", { kind: "http", status: 404, permanent: true });
			}
			return base(url);
		});

		const result = await seedStarterPack(store, fetchFeed, {
			now: new Date("2026-11-24T12:00:00.000Z"),
		});

		expect(result.feeds).toBe(18);
		expect(result.items).toBe(54);
		expect(result.failures).toEqual([
			{ url: STARTER_PACK[0]?.feeds[0]?.feedUrl, error: "HTTP 404" },
		]);
		expect(store.feeds.size).toBe(19);
		const dead = await store.findByUrl(STARTER_PACK[0]?.feeds[0]?.feedUrl ?? "");
		expect(dead).toMatchObject({ lastError: "HTTP 404", lastSuccessAt: null });
	});
});
