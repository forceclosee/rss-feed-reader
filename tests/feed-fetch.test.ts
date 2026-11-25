import { describe, expect, it, vi } from "vitest";
import { FeedFetchError, fetchFeed } from "#/feed/fetch";

function response(body: string | null, init: ResponseInit = {}): Response {
	return new Response(body, init);
}

describe("fetchFeed", () => {
	it("follows permanent redirects and reports the canonical URL", async () => {
		const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
			const url = String(input);
			if (url === "https://old.example/feed.xml") {
				return response(null, {
					status: 301,
					headers: { location: "https://new.example/feed.xml" },
				});
			}
			return response("<rss><channel><title>Moved</title></channel></rss>");
		});

		const result = await fetchFeed("https://old.example/feed.xml", { fetchImpl });

		expect(result).toMatchObject({
			requestedUrl: "https://old.example/feed.xml",
			url: "https://new.example/feed.xml",
			ok: true,
			permanentRedirect: true,
			notModified: false,
		});
		expect(fetchImpl).toHaveBeenCalledTimes(2);
	});

	it("follows temporary redirects without marking the URL permanent", async () => {
		const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
			const url = String(input);
			if (url === "https://old.example/feed.xml") {
				return response(null, {
					status: 302,
					headers: { location: "/moved/feed.xml" },
				});
			}
			return response("<rss><channel><title>Moved</title></channel></rss>");
		});

		const result = await fetchFeed("https://old.example/feed.xml", { fetchImpl });

		expect(result.url).toBe("https://old.example/moved/feed.xml");
		expect(result.permanentRedirect).toBe(false);
	});

	it("treats 304 Not Modified as a successful unchanged fetch", async () => {
		const fetchImpl = vi.fn(async () => response(null, { status: 304 }));

		const result = await fetchFeed("https://example.com/feed.xml", { fetchImpl });

		expect(result).toMatchObject({
			ok: true,
			notModified: true,
			body: null,
			status: 304,
		});
	});

	it("sends conditional headers, a descriptive User-Agent, and accepts feed media types", async () => {
		const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
			return response("<rss />", {
				headers: { etag: '"abc"', "last-modified": "Mon, 15 Jan 2024 10:30:00 GMT" },
			});
		});

		const result = await fetchFeed("https://example.com/feed.xml", {
			fetchImpl,
			etag: '"old"',
			lastModified: "Sun, 14 Jan 2024 10:30:00 GMT",
		});

		const init = fetchImpl.mock.calls[0]?.[1];
		const headers = new Headers(init?.headers);
		expect(headers.get("user-agent")).toMatch(/Frontpage/);
		expect(headers.get("accept")).toContain("application/rss+xml");
		expect(headers.get("if-none-match")).toBe('"old"');
		expect(headers.get("if-modified-since")).toBe("Sun, 14 Jan 2024 10:30:00 GMT");
		expect(result.etag).toBe('"abc"');
		expect(result.lastModified).toBe("Mon, 15 Jan 2024 10:30:00 GMT");
	});

	it("aborts a fetch that exceeds the timeout", async () => {
		const fetchImpl = vi.fn(
			(_input: RequestInfo | URL, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () => {
						reject(new DOMException("Aborted", "AbortError"));
					});
				}),
		);

		await expect(
			fetchFeed("https://slow.example/feed.xml", { fetchImpl, timeoutMs: 10 }),
		).rejects.toMatchObject({ kind: "timeout" });
	});

	it("classifies dead and failing HTTP responses", async () => {
		const notFound = vi.fn(async () => response("gone", { status: 404 }));
		const serverError = vi.fn(async () => response("oops", { status: 500 }));

		await expect(
			fetchFeed("https://dead.example/feed.xml", { fetchImpl: notFound }),
		).rejects.toMatchObject({
			kind: "http",
			status: 404,
			permanent: true,
		});
		await expect(
			fetchFeed("https://flaky.example/feed.xml", { fetchImpl: serverError }),
		).rejects.toMatchObject({
			kind: "http",
			status: 500,
			permanent: false,
		});
	});

	it("gives up on redirect loops", async () => {
		const fetchImpl = vi.fn(async () =>
			response(null, {
				status: 301,
				headers: { location: "https://loop.example/feed.xml" },
			}),
		);

		await expect(fetchFeed("https://loop.example/feed.xml", { fetchImpl })).rejects.toBeInstanceOf(
			FeedFetchError,
		);
	});
});
