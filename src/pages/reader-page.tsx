import { Link } from "@tanstack/react-router";
import { Inbox, Search, Star } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ButtonLink } from "#/components/button-link";
import { type ReaderItem, type ReaderStatus, sortReaderItems } from "#/feed/reader";
import { STARTER_PACK } from "#/feed/starter-pack";
import { cx } from "#/lib/cx";
import { dismissSignUpPrompt, isGuestItemRead, isSignUpDismissed } from "#/lib/guest";

export type { ReaderItem } from "#/feed/reader";

type Destination = {
	label: string;
	icon: ReactNode;
	current?: boolean;
	count?: number;
};

export interface ReaderPageProps {
	items?: ReaderItem[];
	status?: ReaderStatus;
	isGuest?: boolean;
}

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "UTC",
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-US", {
	numeric: "always",
	style: "narrow",
});

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function ReaderPage({ items = [], status, isGuest = false }: ReaderPageProps) {
	const sortedItems = sortReaderItems(items);
	const view: ReaderStatus = status ?? (sortedItems.length > 0 ? "ready" : "empty");
	const feedCount = new Set(sortedItems.map((item) => item.feed.id)).size;

	const [signUpDismissed, setSignUpDismissed] = useState(isSignUpDismissed());

	const destinations: Destination[] = [
		{
			label: "All Items",
			icon: <Inbox aria-hidden="true" className="size-6" />,
			current: true,
			count: sortedItems.length || undefined,
		},
		{ label: "Saved", icon: <Star aria-hidden="true" className="size-6" /> },
		{ label: "Search", icon: <Search aria-hidden="true" className="size-6" /> },
	];

	return (
		<div className="mx-auto w-full max-w-(--page-max-width) px-4 py-8 sm:px-6 lg:py-10">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
						Reader
					</p>
					<h1 className="text-text-primary mt-1 text-xl font-semibold tracking-tight">All Items</h1>
				</div>
				<p className="text-text-secondary text-xs">
					{view === "ready"
						? `${sortedItems.length} ${sortedItems.length === 1 ? "item" : "items"} from ${feedCount} ${feedCount === 1 ? "feed" : "feeds"}`
						: "Sorted newest first"}
				</p>
			</header>

			{isGuest && !signUpDismissed && (
				<GuestSignUpPrompt
					onDismiss={() => {
						dismissSignUpPrompt();
						setSignUpDismissed(true);
					}}
				/>
			)}

			<div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10">
				<aside aria-label="Reader sidebar" className="lg:w-(--sidebar-width) lg:shrink-0">
					<h2
						id="reading-lists-heading"
						className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
						Reading lists
					</h2>
					<nav aria-labelledby="reading-lists-heading" className="mt-3">
						<ul className="flex flex-wrap gap-1 lg:flex-col">
							{destinations.map((destination) => (
								<li key={destination.label}>
									<SidebarLink current={destination.current}>
										{destination.icon}
										<span>{destination.label}</span>
										{destination.count ? (
											<span className="bg-bg-tertiary text-text-secondary ms-auto rounded-full px-2 py-0.5 text-xs">
												{destination.count > 99 ? "99+" : destination.count}
											</span>
										) : null}
									</SidebarLink>
								</li>
							))}
						</ul>
					</nav>

					<h2 className="text-text-secondary mt-8 text-xs font-semibold tracking-widest uppercase">
						Categories
					</h2>
					<ul className="mt-3 space-y-0.5">
						{STARTER_PACK.map((category) => (
							<li key={category.name}>
								<SidebarLink>{category.name}</SidebarLink>
							</li>
						))}
					</ul>
				</aside>

				<section aria-labelledby="items-heading" className="min-w-0 flex-1">
					<h2 id="items-heading" className="sr-only">
						Items
					</h2>
					<div className="border-border-subtle bg-surface rounded-lg border">
						{view === "unavailable" ? (
							<Message
								title="Feed cache unavailable"
								body="The shared feed cache is unavailable right now. Please try again in a moment."
							/>
						) : view === "empty" ? (
							<Message
								title="Nothing here yet"
								body="Items from the Starter Pack will appear once the first feed fetch completes. Real titles, feeds, times, and excerpts will show up here."
							/>
						) : (
							<ul aria-label="Items" className="divide-border-subtle divide-y">
								{sortedItems.map((item) => (
									<ItemRow key={item.id} item={item} isGuest={isGuest} />
								))}
							</ul>
						)}
						<p
							role="status"
							className="border-border-subtle text-text-secondary border-t px-6 py-4 text-xs">
							{view === "unavailable"
								? "The shared feed cache is temporarily unavailable."
								: view === "empty"
									? "The Starter Pack is waiting for its first successful fetch."
									: `Showing the newest ${sortedItems.length} items from ${feedCount} feeds.`}
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}

// TanStack Router marks every Link to the current pathname with
// aria-current="page". Placeholder destinations share /reader, so plain
// anchors keep exactly one current page in the sidebar.
function SidebarLink({ current, children }: { current?: boolean; children: ReactNode }) {
	const className =
		"text-text-secondary hover:bg-bg-tertiary hover:text-text-primary flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors";

	if (current) {
		return (
			<Link to="/reader" aria-current="page" className={className}>
				{children}
			</Link>
		);
	}

	return (
		<a href="/reader" className={className}>
			{children}
		</a>
	);
}

function Message({ title, body }: { title: string; body: string }) {
	return (
		<div className="border-border-subtle border-b px-6 py-5">
			<h3 className="text-text-primary text-lg font-medium">{title}</h3>
			<p className="text-text-secondary mt-1 text-sm">{body}</p>
		</div>
	);
}

function GuestSignUpPrompt({ onDismiss }: { onDismiss: () => void }) {
	return (
		<div className="border-border-subtle bg-bg-secondary mb-6 rounded-lg border px-4 py-3">
			<p className="text-text-secondary text-sm">
				Exploring as a guest. Your feeds and reading state live in this browser session and won't
				persist after you close the tab.
			</p>
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<ButtonLink to="/account" variant="secondary" className="text-sm">
					Sign up to keep them
				</ButtonLink>
				<button
					type="button"
					onClick={onDismiss}
					className="text-text-tertiary hover:text-text-secondary text-sm underline underline-offset-4">
					Maybe later
				</button>
			</div>
		</div>
	);
}

function ItemRow({ item, isGuest }: { item: ReaderItem; isGuest: boolean }) {
	const isRead = isGuest && isGuestItemRead(item.id);
	return (
		<li className={cx("flex gap-4 px-6 py-5", isRead && "opacity-60")}>
			<FeedIcon feed={item.feed} />
			<div className="min-w-0 flex-1">
				<h3 className="text-text-primary text-base leading-snug font-medium">
					{item.url ? (
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							data-item-title
							className="hover:text-accent decoration-border-subtle underline-offset-2 hover:underline">
							{item.title}
						</a>
					) : (
						<span data-item-title>{item.title}</span>
					)}
				</h3>
				<p className="text-text-tertiary mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
					<span className="text-text-secondary font-medium">{item.feed.title}</span>
					{item.publishedAt ? (
						<>
							<span aria-hidden="true">·</span>
							<time
								dateTime={item.publishedAt}
								title={formatFullDate(item.publishedAt)}
								suppressHydrationWarning>
								{formatRelativeTime(item.publishedAt)}
							</time>
						</>
					) : null}
					{item.author ? (
						<>
							<span aria-hidden="true">·</span>
							<span>{item.author}</span>
						</>
					) : null}
				</p>
				{item.excerpt ? <p className="text-text-secondary mt-2 text-sm">{item.excerpt}</p> : null}
			</div>
		</li>
	);
}

function FeedIcon({ feed }: { feed: ReaderItem["feed"] }) {
	const [failed, setFailed] = useState(false);

	if (feed.iconUrl && !failed) {
		return (
			<img
				src={feed.iconUrl}
				alt=""
				width={20}
				height={20}
				loading="lazy"
				referrerPolicy="no-referrer"
				onError={() => setFailed(true)}
				className="bg-bg-tertiary mt-1 size-5 shrink-0 rounded-sm object-cover"
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			data-feed-fallback
			className="bg-accent-subtle text-accent mt-1 flex size-5 shrink-0 items-center justify-center rounded-sm text-xs font-semibold">
			{feed.title.charAt(0).toUpperCase()}
		</span>
	);
}

export function formatRelativeTime(value: string, now = Date.now()): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Undated";

	const difference = date.getTime() - now;
	const magnitude = Math.abs(difference);

	if (magnitude < MINUTE) return "just now";
	if (magnitude < HOUR)
		return relativeTimeFormatter.format(Math.round(difference / MINUTE), "minute");
	if (magnitude < DAY) return relativeTimeFormatter.format(Math.round(difference / HOUR), "hour");
	if (magnitude < WEEK) return relativeTimeFormatter.format(Math.round(difference / DAY), "day");
	if (magnitude < MONTH) return relativeTimeFormatter.format(Math.round(difference / WEEK), "week");
	if (magnitude < YEAR)
		return relativeTimeFormatter.format(Math.round(difference / MONTH), "month");
	return relativeTimeFormatter.format(Math.round(difference / YEAR), "year");
}

export function formatFullDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Undated";
	return fullDateFormatter.format(date);
}
