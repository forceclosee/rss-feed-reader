export function faviconFor(siteUrl: string | null | undefined): string | null {
	if (!siteUrl) return null;

	try {
		return new URL("/favicon.ico", siteUrl).href;
	} catch {
		return null;
	}
}

export function originOf(value: string): string | null {
	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
}

export function hostnameOf(value: string): string | null {
	try {
		return new URL(value).hostname;
	} catch {
		return null;
	}
}
