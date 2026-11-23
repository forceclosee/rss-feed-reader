import { createFileRoute } from "@tanstack/react-router";
import { ReaderPage } from "@/pages/reader-page";

export const Route = createFileRoute("/reader")({
	head: () => ({
		meta: [{ title: "Reader · Frontpage" }],
	}),
	component: ReaderPage,
});
