import { createFileRoute } from "@tanstack/react-router";
import { site } from "#/lib/site";
import { LandingPage } from "#/pages/landing-page";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [{ title: `${site.name} | ${site.tagline}` }],
	}),
	component: LandingPage,
});
