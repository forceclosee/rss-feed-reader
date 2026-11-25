import { FeedFetchError } from "./errors";
import type { FetchedFeed } from "./ingest";

export { FeedFetchError } from "./errors";

export type FeedFetcher = (url: string, options?: FetchFeedOptions) => Promise<FetchedFeed>;

export interface FetchFeedOptions {
	timeoutMs?: number;
	maxRedirects?: number;
	etag?: string | null;
	lastModified?: string | null;
	fetchImpl?: typeof fetch;
}

const USER_AGENT =
	"Frontpage/0.1 (+https://github.com/forceclosee/rss-feed-reader; RSS and Atom reader)";

const ACCEPT =
	"application/rss+xml, application/atom+xml, application/rdf+xml, application/xml, text/xml;q=0.9, */*;q=0.8";

const PERMANENT_REDIRECTS = new Set([301, 308]);
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const PERMANENT_HTTP_ERRORS = new Set([404, 410, 451]);

/**
 * Fetches a Feed with a hard timeout, conditional request headers, and manual
 * redirect handling so a permanent redirect can update the shared Feed URL.
 */
export async function fetchFeed(url: string, options: FetchFeedOptions = {}): Promise<FetchedFeed> {
	const timeoutMs = options.timeoutMs ?? 10_000;
	const maxRedirects = options.maxRedirects ?? 5;
	const fetchImpl = options.fetchImpl ?? fetch;

	let requestedUrl: string;
	try {
		requestedUrl = new URL(url).href;
	} catch (error) {
		throw new FeedFetchError("The feed URL is not valid.", {
			kind: "network",
			permanent: true,
			cause: error,
		});
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const headers = new Headers({
			accept: ACCEPT,
			"user-agent": USER_AGENT,
		});

		if (options.etag) headers.set("if-none-match", options.etag);
		if (options.lastModified) headers.set("if-modified-since", options.lastModified);

		let currentUrl = requestedUrl;
		let permanentRedirect = false;

		for (let redirects = 0; redirects <= maxRedirects; redirects++) {
			const response = await fetchImpl(currentUrl, {
				redirect: "manual",
				signal: controller.signal,
				headers,
			});

			if (REDIRECTS.has(response.status)) {
				const location = response.headers.get("location");
				if (!location) {
					throw new FeedFetchError("The feed redirect did not include a Location header.", {
						kind: "redirect",
						status: response.status,
						permanent: true,
					});
				}

				if (PERMANENT_REDIRECTS.has(response.status)) {
					permanentRedirect = true;
				}

				currentUrl = new URL(location, currentUrl).href;
				continue;
			}

			const etag = response.headers.get("etag");
			const lastModified = response.headers.get("last-modified");

			if (response.status === 304) {
				return {
					requestedUrl,
					url: currentUrl,
					status: response.status,
					ok: true,
					notModified: true,
					permanentRedirect,
					body: null,
					contentType: response.headers.get("content-type"),
					etag,
					lastModified,
				};
			}

			if (!response.ok) {
				throw new FeedFetchError(`HTTP ${response.status}`, {
					kind: "http",
					status: response.status,
					permanent: PERMANENT_HTTP_ERRORS.has(response.status),
				});
			}

			const body = new Uint8Array(await response.arrayBuffer());

			return {
				requestedUrl,
				url: currentUrl,
				status: response.status,
				ok: true,
				notModified: false,
				permanentRedirect,
				body,
				contentType: response.headers.get("content-type"),
				etag,
				lastModified,
			};
		}

		throw new FeedFetchError("The feed redirected too many times.", {
			kind: "redirect",
			permanent: true,
		});
	} catch (error) {
		if (error instanceof FeedFetchError) throw error;

		if (controller.signal.aborted || isAbortError(error)) {
			throw new FeedFetchError(`Timed out after ${timeoutMs}ms`, {
				kind: "timeout",
				cause: error,
			});
		}

		const message = error instanceof Error ? error.message : String(error);
		throw new FeedFetchError(`Network error: ${message}`, {
			kind: "network",
			cause: error,
		});
	} finally {
		clearTimeout(timer);
	}
}

function isAbortError(error: unknown): boolean {
	return error instanceof Error && error.name === "AbortError";
}
