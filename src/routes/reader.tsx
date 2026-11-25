import { createFileRoute } from "@tanstack/react-router";
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
	const { items, status } = Route.useLoaderData();

	return <ReaderPage items={items} status={status} />;
}
