import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"p",
	"a",
	"ul",
	"ol",
	"li",
	"blockquote",
	"pre",
	"code",
	"em",
	"strong",
	"b",
	"i",
	"u",
	"s",
	"del",
	"ins",
	"br",
	"hr",
	"img",
	"figure",
	"figcaption",
	"table",
	"thead",
	"tbody",
	"tfoot",
	"tr",
	"th",
	"td",
	"sup",
	"sub",
	"span",
	"div",
	"dl",
	"dt",
	"dd",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
	a: ["href", "title", "rel", "target"],
	img: ["src", "srcset", "alt", "width", "height", "loading", "referrerpolicy"],
	code: ["class"],
	pre: ["class"],
	th: ["colspan", "rowspan"],
	td: ["colspan", "rowspan"],
};

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: ALLOWED_TAGS,
	allowedAttributes: ALLOWED_ATTRIBUTES,
	allowedClasses: {
		code: [/^(language|lang)-[\w-]+$/],
		pre: [/^(language|lang)-[\w-]+$/],
	},
	allowedSchemes: ["http", "https", "mailto"],
	allowedSchemesByTag: {
		img: ["http", "https"],
	},
	allowedSchemesAppliedToAttributes: ["href", "src", "cite", "srcset"],
	allowProtocolRelative: true,
	disallowedTagsMode: "discard",
	nonTextTags: [
		"script",
		"style",
		"textarea",
		"option",
		"noscript",
		"iframe",
		"object",
		"embed",
		"template",
	],
	transformTags: {
		a: (tagName, attribs) => ({
			tagName,
			attribs: {
				...attribs,
				rel: "noopener noreferrer nofollow",
				target: "_blank",
			},
		}),
		img: (tagName, attribs) => ({
			tagName,
			attribs: {
				...attribs,
				alt: attribs.alt ?? "",
				loading: "lazy",
				referrerpolicy: "no-referrer",
			},
		}),
	},
};

const BASIC_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	"#39": "'",
	nbsp: " ",
};

function decodeBasicEntities(value: string): string {
	return value.replace(/&(amp|lt|gt|quot|apos|#39|nbsp);/g, (_match, entity: string) => {
		return BASIC_ENTITIES[entity] ?? _match;
	});
}

function normalizeWhitespace(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

export interface SanitizedContent {
	html: string | null;
	plainText: string | null;
	excerpt: string | null;
}

export function buildExcerpt(plainText: string | null, maxLength = 280): string | null {
	if (!plainText) return null;
	if (plainText.length <= maxLength) return plainText;

	const clipped = plainText.slice(0, maxLength);
	const lastSpace = clipped.lastIndexOf(" ");
	const boundary = lastSpace > maxLength * 0.6 ? lastSpace : clipped.length;

	return `${clipped.slice(0, boundary).trimEnd()}…`;
}

/**
 * Turns plain text or a fragment with inline markup into readable text.
 * Used for titles, Feed descriptions, and search/excerpt fields.
 */
export function sanitizeFeedText(value: unknown): string | null {
	if (typeof value !== "string") return null;

	const stripped = sanitizeHtml(value, {
		allowedTags: [],
		allowedAttributes: {},
	});
	const text = normalizeWhitespace(decodeBasicEntities(stripped));

	return text || null;
}

/**
 * Sanitizes Feed HTML at ingest. Scripts, frames, forms, event handlers, and
 * unsafe URLs are removed while readable article markup is preserved.
 */
export function sanitizeFeedHtml(value: unknown): SanitizedContent {
	if (typeof value !== "string") {
		return { html: null, plainText: null, excerpt: null };
	}

	const html = sanitizeHtml(value, SANITIZE_OPTIONS).trim();
	const plainText = sanitizeFeedText(html);
	const readableHtml = html || null;

	return {
		html: readableHtml,
		plainText,
		excerpt: buildExcerpt(plainText),
	};
}
