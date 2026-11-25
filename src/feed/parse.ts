import { XMLParser } from "fast-xml-parser";
import { parseFeedDate } from "./date";
import { FeedParseError } from "./errors";
import { sanitizeFeedText } from "./sanitize";

export type FeedFormat = "rss2" | "atom" | "rdf";

export interface ParsedItem {
	guid: string;
	url: string | null;
	title: string;
	author: string | null;
	publishedAt: Date | null;
	contentHtml: string | null;
}

export interface ParsedFeed {
	title: string;
	siteUrl: string | null;
	description: string | null;
	iconUrl: string | null;
	format: FeedFormat;
	items: ParsedItem[];
}

export interface ParseFeedOptions {
	contentType?: string | null;
	sourceUrl: string;
}

type OrderedNode = Record<string, unknown>;

interface XmlText {
	kind: "text";
	text: string;
}

interface XmlElement {
	kind: "element";
	name: string;
	attributes: Record<string, string>;
	children: XmlNode[];
}

type XmlNode = XmlElement | XmlText;

const parser = new XMLParser({
	preserveOrder: true,
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	textNodeName: "#text",
	trimValues: false,
	parseTagValue: false,
	parseAttributeValue: false,
	processEntities: true,
	htmlEntities: true,
	allowBooleanAttributes: true,
	ignoreDeclaration: false,
	ignorePiTags: true,
});

const VOID_ELEMENTS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

export function parseFeed(body: Uint8Array | string, options: ParseFeedOptions): ParsedFeed {
	const xml = typeof body === "string" ? body : decodeBody(body, options.contentType);
	const ordered = parseXml(xml);
	const root = toElements(ordered).find((element) =>
		["rss", "feed", "rdf"].includes(localName(element.name)),
	);

	if (!root) {
		throw new FeedParseError("The response is not an RSS, Atom, or RDF feed.");
	}

	const format = feedFormat(root.name);
	const feedElement = format === "atom" ? root : firstChild(root, "channel");

	if (!feedElement) {
		throw new FeedParseError(`The ${format} feed is missing its channel.`);
	}

	const siteUrl = normalizeHttpUrl(feedSiteLink(feedElement, format), options.sourceUrl);
	const title = textOf(pickChild(feedElement, ["title"]));
	const description = textOf(
		pickChild(feedElement, format === "atom" ? ["subtitle", "description"] : ["description"]),
	);
	const iconUrl = normalizeHttpUrl(feedIcon(feedElement, format), siteUrl ?? options.sourceUrl);

	const itemElements =
		format === "rdf"
			? findChildren(root, "item")
			: format === "atom"
				? findChildren(feedElement, "entry")
				: findChildren(feedElement, "item");

	return {
		title,
		siteUrl,
		description,
		iconUrl,
		format,
		items: itemElements.map((item) => parseItem(item, format, siteUrl ?? options.sourceUrl)),
	};
}

function feedFormat(name: string): FeedFormat {
	const local = localName(name);
	if (local === "feed") return "atom";
	if (local === "rdf") return "rdf";
	return "rss2";
}

function parseItem(item: XmlElement, format: FeedFormat, baseUrl: string): ParsedItem {
	const title = textOf(pickChild(item, ["title"]));
	const author =
		format === "atom"
			? textOf(pickChild(pickChild(item, ["author"]) ?? item, ["name", "email"]))
			: textOf(pickChild(item, ["author", "creator"]));
	const rawLink = itemLink(item, format);
	const url = normalizeHttpUrl(rawLink, baseUrl);
	const publishedAt = itemDate(item, format);
	const contentHtml = itemContent(item, format);
	const guid = itemGuid(item, format, url, title, author, publishedAt);

	return { guid, url, title, author: author || null, publishedAt, contentHtml };
}

function itemLink(item: XmlElement, format: FeedFormat): string {
	if (format === "atom") {
		return atomLink(item, "alternate") ?? "";
	}

	const link = textOf(pickChild(item, ["link"]));
	if (link) return link;

	if (format === "rdf") {
		return attribute(item, "rdf:about") ?? "";
	}

	const guidElement = pickChild(item, ["guid"]);
	if (guidElement) {
		const isPermaLink = (attribute(guidElement, "isPermaLink") ?? "true").toLowerCase();
		if (isPermaLink !== "false") return textOf(guidElement);
	}

	return "";
}

function itemDate(item: XmlElement, format: FeedFormat): Date | null {
	const names =
		format === "atom"
			? ["published", "updated", "issued", "created", "modified"]
			: ["pubDate", "date", "issued", "published"];

	for (const name of names) {
		const element = firstChild(item, name);
		const parsed = parseFeedDate(textOf(element));
		if (parsed) return parsed;
	}

	return null;
}

function itemContent(item: XmlElement, format: FeedFormat): string | null {
	const names = format === "atom" ? ["content", "summary"] : ["encoded", "description"];

	for (const name of names) {
		const element = firstChild(item, name);
		if (!element) continue;

		const content = contentOf(element).trim();
		if (content) return content;
	}

	return null;
}

function itemGuid(
	item: XmlElement,
	format: FeedFormat,
	url: string | null,
	title: string,
	author: string | null,
	publishedAt: Date | null,
): string {
	let guid = "";

	if (format === "atom") {
		guid = textOf(pickChild(item, ["id"]));
	} else if (format === "rdf") {
		guid = attribute(item, "rdf:about") ?? textOf(pickChild(item, ["id"]));
	} else {
		guid = textOf(pickChild(item, ["guid"]));
	}

	guid = guid.trim();
	if (guid) return guid;
	if (url) return url;

	// Content is deliberately excluded: editing a summary must not mint a new
	// Item identity for Feeds that omit guid, link, and date.
	return `generated:${hashIdentity([title, author ?? "", publishedAt?.toISOString() ?? ""].join("|"))}`;
}

function feedSiteLink(feed: XmlElement, format: FeedFormat): string {
	if (format === "atom") {
		return atomLink(feed, "alternate") ?? "";
	}

	return textOf(pickChild(feed, ["link"]));
}

function feedIcon(feed: XmlElement, format: FeedFormat): string {
	if (format === "atom") {
		return textOf(pickChild(feed, ["icon", "logo"]));
	}

	const image = pickChild(feed, ["image"]);
	if (!image) return "";

	return textOf(pickChild(image, ["url"])) || textOf(image);
}

function atomLink(element: XmlElement, rel: string): string | null {
	const links = findChildren(element, "link").map((link) => ({
		href: attribute(link, "href") ?? textOf(link),
		rel: (attribute(link, "rel") ?? "alternate").toLowerCase(),
		type: (attribute(link, "type") ?? "").toLowerCase(),
	}));

	const candidates = links.filter((link) => link.href);
	const preferred =
		candidates.find((link) => link.rel === rel && (!link.type || link.type.includes("html"))) ??
		candidates.find((link) => link.rel === rel) ??
		candidates.find((link) => !link.rel) ??
		candidates[0];

	return preferred?.href ?? null;
}

function normalizeHttpUrl(value: string | null | undefined, baseUrl: string): string | null {
	if (!value) return null;

	try {
		const url = new URL(value.trim(), baseUrl);
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		return url.href;
	} catch {
		return null;
	}
}

function decodeBody(body: Uint8Array, contentType: string | null | undefined): string {
	const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
	const bomEncoding = detectBom(bytes);
	const declared = detectEncoding(bytes);
	const contentTypeEncoding = charsetFromContentType(contentType);
	const candidates = [bomEncoding, contentTypeEncoding, declared, "utf-8"].filter(
		(value): value is string => Boolean(value),
	);

	for (const encoding of candidates) {
		const decoded = tryDecode(bytes, encoding, true);
		if (decoded !== null) return stripBom(decoded);
	}

	const fallback = tryDecode(bytes, "windows-1252", false);
	return stripBom(fallback ?? "");
}

function detectBom(bytes: Uint8Array): string | null {
	if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8";
	if (bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
	if (bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
	return null;
}

function detectEncoding(bytes: Uint8Array): string | null {
	const head = tryDecode(bytes.slice(0, 256), "windows-1252", false) ?? "";
	const match = /<\?xml[^>]*encoding=["']([^"']+)["']/i.exec(head);
	return match?.[1] ?? null;
}

function charsetFromContentType(contentType: string | null | undefined): string | null {
	if (!contentType) return null;
	const match = /charset\s*=\s*["']?([^"';\s]+)/i.exec(contentType);
	return match?.[1] ?? null;
}

function tryDecode(bytes: Uint8Array, encoding: string, fatal: boolean): string | null {
	try {
		return new TextDecoder(encoding, { fatal }).decode(bytes);
	} catch {
		return null;
	}
}

function stripBom(value: string): string {
	return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function parseXml(xml: string): OrderedNode[] {
	try {
		const parsed: unknown = parser.parse(xml);
		return Array.isArray(parsed) ? (parsed as OrderedNode[]) : [];
	} catch (error) {
		throw new FeedParseError("The feed XML could not be parsed.", { cause: error });
	}
}

function toElements(nodes: OrderedNode[]): XmlElement[] {
	return nodes.map(toNode).filter((node): node is XmlElement => node?.kind === "element");
}

function toNode(node: OrderedNode): XmlNode | null {
	const text = node["#text"];
	if (typeof text === "string" && Object.keys(node).every((key) => key === "#text")) {
		return { kind: "text", text };
	}

	const tagName = Object.keys(node).find(
		(key) => key !== ":@" && !key.startsWith("#") && !key.startsWith("?"),
	);
	if (!tagName) return null;

	const rawAttributes = node[":@"];
	const attributes =
		rawAttributes && typeof rawAttributes === "object"
			? Object.fromEntries(
					Object.entries(rawAttributes as Record<string, unknown>).map(([key, value]) => [
						key.replace(/^@_/, ""),
						String(value),
					]),
				)
			: {};

	const children = Array.isArray(node[tagName]) ? (node[tagName] as OrderedNode[]) : [];

	return {
		kind: "element",
		name: tagName,
		attributes,
		children: children.map(toNode).filter((child): child is XmlNode => child !== null),
	};
}

function localName(name: string): string {
	return name.split(":").pop()?.toLowerCase() ?? name.toLowerCase();
}

function isElement(node: XmlNode): node is XmlElement {
	return node.kind === "element";
}

function findChildren(element: XmlElement, ...names: string[]): XmlElement[] {
	const wanted = new Set(names.map((name) => name.toLowerCase()));
	return element.children.filter(
		(child): child is XmlElement => isElement(child) && wanted.has(localName(child.name)),
	);
}

function firstChild(element: XmlElement, name: string): XmlElement | undefined {
	return findChildren(element, name)[0];
}

function pickChild(element: XmlElement | undefined, names: string[]): XmlElement | undefined {
	if (!element) return undefined;

	for (const name of names) {
		const child = firstChild(element, name);
		if (child) return child;
	}

	return undefined;
}

function attribute(element: XmlElement, name: string): string | null {
	const exact = element.attributes[name];
	if (exact !== undefined) return exact;

	const wanted = localName(name);
	for (const [key, value] of Object.entries(element.attributes)) {
		if (localName(key) === wanted) return value;
	}

	return null;
}

function textOf(element: XmlElement | undefined): string {
	if (!element) return "";

	const text = element.children
		.map((child) => (isElement(child) ? textOf(child) : child.text))
		.join("");

	return sanitizeFeedText(text) ?? "";
}

function contentOf(element: XmlElement): string {
	const hasOnlyText = element.children.every((child) => !isElement(child));
	if (hasOnlyText) {
		return element.children.map((child) => (isElement(child) ? "" : child.text)).join("");
	}

	return innerXml(element);
}

function innerXml(element: XmlElement): string {
	return element.children.map(renderNode).join("");
}

function renderNode(node: XmlNode): string {
	if (!isElement(node)) return escapeText(node.text);
	return renderElement(node);
}

function renderElement(element: XmlElement): string {
	const name = localName(element.name);
	const attributes = Object.entries(element.attributes)
		.filter(([key]) => !key.toLowerCase().startsWith("xmlns"))
		.map(([key, value]) => ` ${localName(key)}="${escapeAttribute(value)}"`)
		.join("");

	if (VOID_ELEMENTS.has(name)) {
		return `<${name}${attributes} />`;
	}

	return `<${name}${attributes}>${innerXml(element)}</${name}>`;
}

function escapeText(value: string): string {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
	return escapeText(value).replace(/"/g, "&quot;");
}

function hashIdentity(value: string): string {
	let hash = 0x811c9dc5;

	for (let index = 0; index < value.length; index++) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193);
	}

	return (hash >>> 0).toString(16).padStart(8, "0");
}
