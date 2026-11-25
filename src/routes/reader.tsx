import { createFileRoute } from "@tanstack/react-router";
import type { ReaderItem, ReaderStatus } from "#/feed/reader";
import { getGuestItems, isGuestSession } from "#/lib/guest";
import { ReaderPage } from "#/pages/reader-page";
import { loadReader } from "#/server/reader";

export const Route = createFileRoute("/reader")({
	head: () => ({
		meta: [{ title: "Reader · Frontpage" }],
	}),
	loader: () => loadReader(),
	component: ReaderRoute,
});

function ReaderRoute() {
	const { items: loaderItems, status: loaderStatus } = Route.useLoaderData();

	const guest = isGuestSession();
	const guestItems = guest ? getGuestItems() : [];
	const items: ReaderItem[] = guest && guestItems.length > 0 ? guestItems : loaderItems;
	const status: ReaderStatus = guest ? (items.length > 0 ? "ready" : "empty") : loaderStatus;

	return <ReaderPage items={items} status={status} isGuest={guest} />;
}
