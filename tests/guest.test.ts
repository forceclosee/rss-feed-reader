import { afterEach, describe, expect, it } from "vitest";
import type { ReaderItem } from "#/feed/reader";
import { STARTER_PACK } from "#/feed/starter-pack";
import {
	clearGuestSession,
	dismissSignUpPrompt,
	getGuestBookmarks,
	getGuestItems,
	getGuestSubscriptions,
	isGuestItemBookmarked,
	isGuestItemRead,
	isGuestSession,
	isSignUpDismissed,
	markGuestItemRead,
	setGuestItems,
	startGuestSession,
	toggleGuestBookmark,
	toggleGuestItemRead,
} from "#/lib/guest";

afterEach(() => {
	sessionStorage.clear();
});

describe("isGuestSession", () => {
	it("is false when no guest session has been started", () => {
		expect(isGuestSession()).toBe(false);
	});

	it("is true after startGuestSession", () => {
		startGuestSession();
		expect(isGuestSession()).toBe(true);
	});
});

describe("startGuestSession", () => {
	it("marks the session as guest and records the Starter Pack subscriptions", () => {
		startGuestSession();

		expect(isGuestSession()).toBe(true);
		const subscriptions = getGuestSubscriptions();
		expect(subscriptions).toHaveLength(STARTER_PACK.length);
		expect(subscriptions.map((s) => s.category)).toEqual(
			STARTER_PACK.map((category) => category.name),
		);
		const totalFeedUrls = subscriptions.flatMap((s) => s.feedUrls);
		expect(totalFeedUrls).toHaveLength(STARTER_PACK.flatMap((category) => category.feeds).length);
	});

	it("does not create a database user or touch the network", () => {
		expect(sessionStorage.getItem("frontpage:guest:active")).toBeNull();
		startGuestSession();
		expect(sessionStorage.getItem("frontpage:guest:active")).toBe("1");
	});

	it("seeds starter items when provided", () => {
		const items: ReaderItem[] = [
			{
				id: "item-1",
				title: "A guest item",
				url: "https://example.com/one",
				author: null,
				publishedAt: "2026-11-24T12:00:00.000Z",
				excerpt: "An excerpt.",
				feed: { id: "feed-1", title: "Example Blog", siteUrl: null, iconUrl: null },
			},
		];

		startGuestSession({ items });

		expect(getGuestItems()).toEqual(items);
	});
});

describe("clearGuestSession", () => {
	it("removes the guest flag so the session no longer counts as guest", () => {
		startGuestSession();
		expect(isGuestSession()).toBe(true);

		clearGuestSession();

		expect(isGuestSession()).toBe(false);
		expect(sessionStorage.getItem("frontpage:guest:active")).toBeNull();
		expect(sessionStorage.getItem("frontpage:guest:subscriptions")).toBeNull();
	});
});

describe("guest items", () => {
	it("round-trips items through sessionStorage", () => {
		const items: ReaderItem[] = [
			{
				id: "item-1",
				title: "First item",
				url: null,
				author: null,
				publishedAt: null,
				excerpt: null,
				feed: { id: "feed-1", title: "Feed One", siteUrl: null, iconUrl: null },
			},
		];

		setGuestItems(items);
		expect(getGuestItems()).toEqual(items);
	});

	it("returns an empty array when no items are stored", () => {
		expect(getGuestItems()).toEqual([]);
	});
});

describe("guest read state", () => {
	it("tracks read state per item in sessionStorage", () => {
		expect(isGuestItemRead("item-1")).toBe(false);

		markGuestItemRead("item-1", true);
		expect(isGuestItemRead("item-1")).toBe(true);

		markGuestItemRead("item-1", false);
		expect(isGuestItemRead("item-1")).toBe(false);
	});

	it("toggles read state", () => {
		toggleGuestItemRead("item-1");
		expect(isGuestItemRead("item-1")).toBe(true);
		toggleGuestItemRead("item-1");
		expect(isGuestItemRead("item-1")).toBe(false);
	});

	it("is independent between items", () => {
		markGuestItemRead("item-1", true);
		expect(isGuestItemRead("item-1")).toBe(true);
		expect(isGuestItemRead("item-2")).toBe(false);
	});
});

describe("guest bookmarks", () => {
	it("tracks bookmarks per item in sessionStorage", () => {
		expect(isGuestItemBookmarked("item-1")).toBe(false);
		expect(getGuestBookmarks()).toEqual([]);

		toggleGuestBookmark("item-1");
		expect(isGuestItemBookmarked("item-1")).toBe(true);
		expect(getGuestBookmarks()).toEqual(["item-1"]);

		toggleGuestBookmark("item-1");
		expect(isGuestItemBookmarked("item-1")).toBe(false);
		expect(getGuestBookmarks()).toEqual([]);
	});
});

describe("sign-up prompt dismissal", () => {
	it("persists dismissal across the session", () => {
		expect(isSignUpDismissed()).toBe(false);

		dismissSignUpPrompt();
		expect(isSignUpDismissed()).toBe(true);
	});

	it("is cleared when the guest session is cleared", () => {
		dismissSignUpPrompt();
		expect(isSignUpDismissed()).toBe(true);

		clearGuestSession();
		expect(isSignUpDismissed()).toBe(false);
	});
});
