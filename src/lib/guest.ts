import type { ReaderItem } from "#/feed/reader";
import { STARTER_PACK } from "#/feed/starter-pack";

const PREFIX = "frontpage:guest:";

const KEYS = {
	active: `${PREFIX}active`,
	startedAt: `${PREFIX}startedAt`,
	subscriptions: `${PREFIX}subscriptions`,
	items: `${PREFIX}items`,
	read: `${PREFIX}read`,
	bookmarks: `${PREFIX}bookmarks`,
	dismissedSignUp: `${PREFIX}signUpDismissed`,
} as const;

export interface GuestSubscription {
	category: string;
	feedUrls: string[];
}

export interface GuestSessionState {
	active: boolean;
	startedAt: string | null;
	subscriptions: GuestSubscription[];
	items: ReaderItem[];
	read: Record<string, boolean>;
	bookmarks: string[];
}

function isStorageAvailable(): boolean {
	return typeof sessionStorage !== "undefined";
}

/** Returns true when the current browser session is a Guest Session. */
export function isGuestSession(): boolean {
	if (!isStorageAvailable()) return false;
	return sessionStorage.getItem(KEYS.active) === "1";
}

/**
 * Begins a Guest Session. The Starter Pack subscriptions are recorded in
 * `sessionStorage` so the Reader can organize content by the five curated
 * categories without creating a database User. Optional starter items can be
 * seeded at the same time; otherwise items load from the shared server cache.
 */
export function startGuestSession(options: { items?: ReaderItem[] } = {}): void {
	if (!isStorageAvailable()) return;

	const subscriptions: GuestSubscription[] = STARTER_PACK.map((category) => ({
		category: category.name,
		feedUrls: category.feeds.map((feed) => feed.feedUrl),
	}));

	sessionStorage.setItem(KEYS.active, "1");
	sessionStorage.setItem(KEYS.startedAt, new Date().toISOString());
	sessionStorage.setItem(KEYS.subscriptions, JSON.stringify(subscriptions));

	if (options.items) {
		sessionStorage.setItem(KEYS.items, JSON.stringify(options.items));
	}
}

/** Clears every Guest Session key. A tab close does this natively via sessionStorage. */
export function clearGuestSession(): void {
	if (!isStorageAvailable()) return;
	for (const key of Object.values(KEYS)) {
		sessionStorage.removeItem(key);
	}
}

export function getGuestSubscriptions(): GuestSubscription[] {
	if (!isStorageAvailable()) return [];
	const raw = sessionStorage.getItem(KEYS.subscriptions);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as GuestSubscription[];
	} catch {
		return [];
	}
}

export function getGuestItems(): ReaderItem[] {
	if (!isStorageAvailable()) return [];
	const raw = sessionStorage.getItem(KEYS.items);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as ReaderItem[];
	} catch {
		return [];
	}
}

export function setGuestItems(items: ReaderItem[]): void {
	if (!isStorageAvailable()) return;
	sessionStorage.setItem(KEYS.items, JSON.stringify(items));
}

export function isGuestItemRead(itemId: string): boolean {
	if (!isStorageAvailable()) return false;
	const raw = sessionStorage.getItem(KEYS.read);
	if (!raw) return false;
	try {
		return (JSON.parse(raw) as Record<string, boolean>)[itemId] === true;
	} catch {
		return false;
	}
}

export function markGuestItemRead(itemId: string, read: boolean): void {
	if (!isStorageAvailable()) return;
	const raw = sessionStorage.getItem(KEYS.read);
	const readState: Record<string, boolean> = raw
		? (JSON.parse(raw) as Record<string, boolean>)
		: {};
	readState[itemId] = read;
	sessionStorage.setItem(KEYS.read, JSON.stringify(readState));
}

export function toggleGuestItemRead(itemId: string): void {
	markGuestItemRead(itemId, !isGuestItemRead(itemId));
}

export function isGuestItemBookmarked(itemId: string): boolean {
	if (!isStorageAvailable()) return false;
	const raw = sessionStorage.getItem(KEYS.bookmarks);
	if (!raw) return false;
	try {
		return (JSON.parse(raw) as string[]).includes(itemId);
	} catch {
		return false;
	}
}

export function toggleGuestBookmark(itemId: string): void {
	if (!isStorageAvailable()) return;
	const raw = sessionStorage.getItem(KEYS.bookmarks);
	const bookmarks: string[] = raw ? (JSON.parse(raw) as string[]) : [];
	const index = bookmarks.indexOf(itemId);
	if (index === -1) {
		bookmarks.push(itemId);
	} else {
		bookmarks.splice(index, 1);
	}
	sessionStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
}

export function getGuestBookmarks(): string[] {
	if (!isStorageAvailable()) return [];
	const raw = sessionStorage.getItem(KEYS.bookmarks);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as string[];
	} catch {
		return [];
	}
}

export function isSignUpDismissed(): boolean {
	if (!isStorageAvailable()) return false;
	return sessionStorage.getItem(KEYS.dismissedSignUp) === "1";
}

export function dismissSignUpPrompt(): void {
	if (!isStorageAvailable()) return;
	sessionStorage.setItem(KEYS.dismissedSignUp, "1");
}
