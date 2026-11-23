import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell } from "#/components/app-shell";
import { ButtonLink } from "#/components/button-link";
import { site } from "#/lib/site";
import appCss from "../styles/global.css?url";

export const Route = createRootRoute({
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
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFound,
});

function RootComponent() {
	return (
		<RootDocument>
			<AppShell>
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
			<p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">404</p>
			<h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
				Page not found
			</h1>
			<p className="mt-3 text-sm text-text-secondary">
				That route does not exist yet. Head back to the landing page to keep exploring.
			</p>
			<ButtonLink to="/" className="mt-6">
				Back to Frontpage
			</ButtonLink>
		</div>
	);
}
