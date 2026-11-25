export type FeedErrorKind = "timeout" | "network" | "http" | "redirect" | "parse";

export interface FeedErrorOptions {
	kind: FeedErrorKind;
	permanent?: boolean;
	status?: number;
	cause?: unknown;
}

export class FeedError extends Error {
	readonly kind: FeedErrorKind;
	readonly permanent: boolean;
	readonly status?: number;

	constructor(message: string, options: FeedErrorOptions) {
		super(message, { cause: options.cause });
		this.name = "FeedError";
		this.kind = options.kind;
		this.permanent = options.permanent ?? false;
		this.status = options.status;
	}
}

export class FeedFetchError extends FeedError {
	constructor(message: string, options: FeedErrorOptions) {
		super(message, options);
		this.name = "FeedFetchError";
	}
}

export class FeedParseError extends FeedError {
	constructor(message: string, options: { cause?: unknown } = {}) {
		super(message, { kind: "parse", permanent: true, cause: options.cause });
		this.name = "FeedParseError";
	}
}
