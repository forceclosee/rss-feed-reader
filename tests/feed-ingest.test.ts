import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFeedDate } from "#/feed/date";
import { FeedParseError } from "#/feed/errors";
import { type FetchedFeed, ingestFeed } from "#/feed/ingest";
import { sanitizeFeedHtml } from "#/feed/sanitize";

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

describe("ingestFeed", () => {
	it("normalizes RSS 2.0 feeds, including entities, full content, and missing fields", () => {
		const feed = ingestFeed(fetched("rss2.xml"));

		expect(feed.feed).toMatchObject({
			url: "https://example.com/rss2.xml",
			title: "Frontpage Test Feed & Friends",
			siteUrl: "https://example.com/blog/",
			description: "Notes & tutorials",
			iconUrl: "https://example.com/icon.png",
			format: "rss2",
		});
		expect(feed.items).toHaveLength(3);

		const [first, second, third] = feed.items;
		expect(first).toMatchObject({
			guid: "post-1",
			url: "https://example.com/blog/hello",
			title: "Hello — World ’24",
			author: "Jane Doe",
			publishedAt: "2024-01-15T10:30:00.000Z",
		});
		expect(first?.contentHtml).toContain("<h2>Full article</h2>");
		expect(first?.contentHtml).toContain('href="https://example.com"');
		expect(first?.contentHtml).toContain(">good</a>");
		expect(first?.contentHtml).toContain('<code class="language-js">const x = 1 &lt; 2;</code>');
		expect(first?.contentHtml).not.toMatch(/script|iframe|form|onclick|onerror|javascript:/i);
		expect(first?.plainText).toContain("Full article");
		expect(first?.plainText).toContain("const x = 1 < 2;");
		expect(first?.plainText).not.toContain("<h2>");
		expect(first?.excerpt).toContain("Full article");
		expect(first?.excerpt?.length).toBeLessThanOrEqual(300);

		expect(second?.guid).toBe("https://example.com/blog/second");
		expect(second?.publishedAt).toBe("2024-01-16T06:00:00.000Z");

		expect(third?.guid).toMatch(/^generated:/);
		expect(third?.url).toBeNull();
		expect(third?.author).toBeNull();
		expect(third?.publishedAt).toBeNull();
		expect(third?.excerpt).toBe("Only a summary.");
	});

	it("normalizes Atom 1.0 feeds, preferring full content and HTML alternates", () => {
		const feed = ingestFeed(fetched("atom.xml"));

		expect(feed.feed).toMatchObject({
			title: "Atom Example",
			siteUrl: "https://atom.example/",
			description: "Short & sweet",
			iconUrl: "https://atom.example/icon.png",
			format: "atom",
		});
		expect(feed.items).toHaveLength(3);

		const [first, second, third] = feed.items;
		expect(first).toMatchObject({
			guid: "tag:atom.example,2024:1",
			url: "https://atom.example/first",
			title: "First entry",
			author: "Sam Reader",
			publishedAt: "2024-02-01T09:15:00.000Z",
		});
		expect(first?.contentHtml).toBe("<p>Full <em>HTML</em> body.</p>");
		expect(first?.contentHtml).not.toContain("Summary should not win");
		expect(first?.contentHtml).not.toContain("<script");

		expect(second).toMatchObject({
			title: "XHTML title",
			url: null,
			author: null,
			publishedAt: null,
		});
		expect(second?.contentHtml).toContain("<p>XHTML body with <strong>markup</strong>.</p>");

		expect(third?.url).toBe("https://atom.example/third");
		expect(third?.contentHtml).toBe("Only a summary is available.");
	});

	it("normalizes RSS 1.0 / RDF feeds", () => {
		const feed = ingestFeed(fetched("rdf.xml"));

		expect(feed.feed).toMatchObject({
			title: "RDF Example",
			siteUrl: "https://rdf.example/",
			description: "An RSS 1.0 feed.",
			format: "rdf",
		});
		expect(feed.items).toHaveLength(2);

		const [first, second] = feed.items;
		expect(first).toMatchObject({
			guid: "https://rdf.example/one",
			url: "https://rdf.example/one",
			title: "RDF item one",
			author: "RDF Author",
			publishedAt: "2024-03-04T11:00:00.000Z",
		});
		expect(first?.contentHtml).toBe("<p>RDF <strong>content</strong>.</p>");
		expect(second?.publishedAt).toBeNull();
	});

	it("decodes Windows-1252 and undeclared legacy encodings", () => {
		const declared = ingestFeed(fetched("windows-1252.xml"));
		expect(declared.feed.title).toBe("Café “quoted”");
		expect(declared.feed.description).toBe("Price: 5€ — “nice”");
		expect(declared.items[0]?.title).toBe("Café “quoted”");

		const undeclared = ingestFeed(fetched("latin1-no-declaration.xml"));
		expect(undeclared.feed.title).toBe("Café");
		expect(undeclared.items[0]?.title).toBe("Café sans déclaration");
		expect(undeclared.items[0]?.excerpt).toBe("Résumé");
	});

	it("recovers what it can from malformed XML and rejects documents that are not feeds", () => {
		const partial = ingestFeed(fetched("malformed.xml"));
		expect(partial.feed.title).toBe("Partially Broken");
		expect(partial.items.length).toBeGreaterThanOrEqual(1);
		expect(partial.items[0]?.guid).toBe("partial-1");

		expect(() => ingestFeed(fetched("broken.xml"))).toThrow(FeedParseError);
	});

	it("uses fallback feed metadata when the source omits it", () => {
		const feed = ingestFeed(
			{
				...fetched("broken.xml"),
				body: new TextEncoder().encode(
					'<rss version="2.0"><channel><item><guid>x</guid><title>Only item</title></item></channel></rss>',
				),
			},
			{
				fallbackTitle: "Fallback title",
				fallbackSiteUrl: "https://fallback.example/",
				fallbackDescription: "Fallback description",
			},
		);

		expect(feed.feed.title).toBe("Fallback title");
		expect(feed.feed.siteUrl).toBe("https://fallback.example/");
		expect(feed.feed.description).toBe("Fallback description");
		expect(feed.feed.iconUrl).toBe("https://fallback.example/favicon.ico");
	});

	it("falls back to summaries when full content is empty or external", () => {
		const atom = ingestFeed({
			...fetched("broken.xml"),
			body: new TextEncoder().encode(
				'<feed xmlns="http://www.w3.org/2005/Atom"><title>Atom</title><entry><id>1</id><title>Entry</title><link href="https://atom.example/1" /><content src="https://atom.example/full" /><summary>Summary wins</summary></entry></feed>',
			),
		});
		expect(atom.items[0]?.contentHtml).toBe("Summary wins");

		const rss = ingestFeed({
			...fetched("broken.xml"),
			body: new TextEncoder().encode(
				'<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>RSS</title><item><guid>1</guid><title>Item</title><content:encoded></content:encoded><description>Description wins</description></item></channel></rss>',
			),
		});
		expect(rss.items[0]?.contentHtml).toBe("Description wins");
	});

	it("uses a permalink guid as the Item URL when no link is present", () => {
		const body = (attributes: string) =>
			new TextEncoder().encode(
				`<rss version="2.0"><channel><title>RSS</title><item><guid ${attributes}>https://example.com/post</guid><title>Post</title></item></channel></rss>`,
			);

		const permalink = ingestFeed({
			...fetched("broken.xml"),
			body: body('isPermaLink="true"'),
		});
		expect(permalink.items[0]?.url).toBe("https://example.com/post");

		const opaque = ingestFeed({
			...fetched("broken.xml"),
			body: body('isPermaLink="false"'),
		});
		expect(opaque.items[0]?.url).toBeNull();
	});

	it("keeps generated identity stable when only the summary changes", () => {
		const body = (description: string) =>
			new TextEncoder().encode(
				`<rss version="2.0"><channel><title>RSS</title><item><title>Stable</title><description>${description}</description></item></channel></rss>`,
			);

		const first = ingestFeed({ ...fetched("broken.xml"), body: body("First summary") });
		const second = ingestFeed({ ...fetched("broken.xml"), body: body("Second summary") });

		expect(first.items[0]?.guid).toMatch(/^generated:/);
		expect(second.items[0]?.guid).toBe(first.items[0]?.guid);
	});

	it("keeps item identity stable across repeated ingests", () => {
		const first = ingestFeed(fetched("rss2.xml"));
		const second = ingestFeed(fetched("rss2.xml"));

		expect(second.items.map((item) => item.guid)).toEqual(first.items.map((item) => item.guid));
	});
});

describe("sanitizeFeedHtml", () => {
	it("removes unsafe markup and URLs while preserving readable content", () => {
		const result = sanitizeFeedHtml(readFileSync(fixture("unsafe.html"), "utf8"));

		expect(result.html).toContain("<h2>Heading</h2>");
		expect(result.html).toContain('<a href="https://example.com"');
		expect(result.html).toContain('<img src="https://example.com/photo.png"');
		expect(result.html).toContain("<ul><li>One</li><li>Two</li></ul>");
		expect(result.html).toContain('<code class="language-ts">');
		expect(result.html).not.toMatch(
			/script|iframe|<form|<input|<button|onclick|onerror|onmouseover/i,
		);
		expect(result.html).not.toContain("javascript:");
		expect(result.html).not.toContain("data:text/html");
		expect(result.html).not.toContain("data-evil");
		expect(result.html).not.toContain("<style");
		expect(result.plainText).toContain("Hello bad link and good link.");
		expect(result.plainText).toContain("const n: number = 1 < 2;");
		expect(result.plainText).not.toContain("<p>");
		expect(result.excerpt?.length).toBeLessThanOrEqual(300);
	});

	it("returns empty values for content with no readable text", () => {
		const result = sanitizeFeedHtml(
			'<script>alert(1)</script><iframe src="https://evil.example"></iframe>',
		);

		expect(result.html).toBeNull();
		expect(result.plainText).toBeNull();
		expect(result.excerpt).toBeNull();
	});
});

describe("parseFeedDate", () => {
	it("normalizes RFC 822, ISO 8601, timezone-less, and non-standard dates", () => {
		expect(parseFeedDate("Mon, 15 Jan 2024 10:30:00 GMT")?.toISOString()).toBe(
			"2024-01-15T10:30:00.000Z",
		);
		expect(parseFeedDate("2024-02-01T09:15:00+02:00")?.toISOString()).toBe(
			"2024-02-01T07:15:00.000Z",
		);
		expect(parseFeedDate("2024-02-01T09:15:00")?.toISOString()).toBe("2024-02-01T09:15:00.000Z");
		expect(parseFeedDate("January 15, 2024")?.toISOString()).toBe("2024-01-15T00:00:00.000Z");
		expect(parseFeedDate("1705314600")?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
	});

	it("returns null for missing or invalid dates", () => {
		expect(parseFeedDate(undefined)).toBeNull();
		expect(parseFeedDate("")).toBeNull();
		expect(parseFeedDate("not a date")).toBeNull();
	});
});
