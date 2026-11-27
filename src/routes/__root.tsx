import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell } from "#/components/app-shell";
import { ButtonLink } from "#/components/button-link";
import { getSession } from "#/lib/auth.functions";
import { site } from "#/lib/site";
import "@fontsource/inter";
import "@fontsource/jetbrains-mono";
import appCss from "../styles/global.css?url";

export const Route = createRootRoute({
	beforeLoad: async () => ({ authSession: await getSession() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "description", content: site.description },
			{
				name: "theme-color",
				content: "#ffffff",
				media: "(prefers-color-scheme: light)",
			},
			{
				name: "theme-color",
				content: "#0d1117",
				media: "(prefers-color-scheme: dark)",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFound,
});

function RootComponent() {
	const { authSession } = Route.useRouteContext();

	return (
		<RootDocument>
			<AppShell session={authSession}>
				<Outlet />
			</AppShell>
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<div className="mx-auto w-full max-w-(--content-max-width) px-4 py-16 sm:px-6">
			<p className="text-text-secondary text-xs font-semibold tracking-widest uppercase">404</p>
			<h1 className="text-text-primary mt-1 text-xl font-semibold tracking-tight">
				Page not found
			</h1>
			<p className="text-text-secondary mt-3 text-sm">
				That route does not exist yet. Head back to the landing page to keep exploring.
			</p>
			<ButtonLink to="/" className="mt-6">
				Back to Frontpage
			</ButtonLink>
		</div>
	);
}
