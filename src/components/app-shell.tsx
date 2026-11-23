import { Link } from "@tanstack/react-router";
import { Rss } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "#/lib/cx";
import { site } from "#/lib/site";

const navigation = [
	{ to: "/reader", label: "Reader" },
	{ to: "/account", label: "Account" },
] as const;

const navLinkClasses =
	"rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary";

export function AppShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col bg-bg-primary text-text-primary">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-text-primary focus:shadow-md"
			>
				Skip to content
			</a>
			<header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-primary/90 backdrop-blur">
				<div className="mx-auto flex h-14 w-full max-w-(--page-max-width) items-center justify-between gap-6 px-4 sm:px-6">
					<Link
						to="/"
						className="flex items-center gap-2 rounded-md text-text-primary focus-visible:outline-accent"
						activeOptions={{ exact: true }}
					>
						<span className="flex size-8 items-center justify-center rounded-md bg-accent-subtle text-accent">
							<Rss aria-hidden="true" className="size-4" strokeWidth={2} />
						</span>
						<span className="text-base font-semibold tracking-tight">{site.name}</span>
					</Link>
					<nav aria-label="Primary">
						<ul className="flex items-center gap-1">
							{navigation.map((item) => (
								<li key={item.to}>
									<Link
										to={item.to}
										className={navLinkClasses}
										activeProps={{
											className: cx(navLinkClasses, "bg-bg-tertiary text-text-primary"),
											"aria-current": "page",
										}}
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</header>
			<main id="main" className="flex-1">
				{children}
			</main>
			<footer className="border-t border-border-subtle">
				<div className="mx-auto flex w-full max-w-(--page-max-width) flex-col gap-2 px-4 py-6 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6">
					<p>{site.tagline}</p>
					<p>Built with TanStack Start, Drizzle, Neon, and Cloudflare.</p>
				</div>
			</footer>
		</div>
	);
}
