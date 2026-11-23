import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/pages/landing-page";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [{ title: "Frontpage — Your personalized front page for tech content" }],
	}),
	component: LandingPage,
});
