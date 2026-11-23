import { Link } from "@tanstack/react-router";
import { Inbox, Search, Star } from "lucide-react";
import type { ReactNode } from "react";

type Destination = {
	label: string;
	icon: ReactNode;
	active?: boolean;
	count?: number;
};

const destinations: Destination[] = [
	{ label: "All Items", icon: <Inbox aria-hidden="true" className="size-6" />, active: true },
	{ label: "Saved", icon: <Star aria-hidden="true" className="size-6" /> },
	{ label: "Search", icon: <Search aria-hidden="true" className="size-6" /> },
];

const categories = ["Frontend", "Design", "Backend & DevOps", "General Tech", "AI & ML"];

export function ReaderPage() {
	return (
		<div className="mx-auto w-full max-w-(--page-max-width) px-4 py-8 sm:px-6 lg:py-10">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
						Reader
					</p>
					<h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">All Items</h1>
				</div>
				<p className="text-xs text-text-secondary">Sorted newest first</p>
			</header>

			<div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10">
				<aside
					aria-labelledby="reading-lists-heading"
					className="lg:w-(--sidebar-width) lg:shrink-0"
				>
					<h2
						id="reading-lists-heading"
						className="text-xs font-semibold uppercase tracking-widest text-text-secondary"
					>
						Reading lists
					</h2>
					<nav aria-label="Reading lists" className="mt-3">
						<ul className="flex flex-wrap gap-1 lg:flex-col">
							{destinations.map((destination) => (
								<li key={destination.label}>
									<Link
										to="/reader"
										aria-current={destination.active ? "page" : undefined}
										className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary aria-[current=page]:bg-bg-tertiary aria-[current=page]:text-text-primary"
									>
										{destination.icon}
										<span>{destination.label}</span>
										{destination.count ? (
											<span className="ms-auto rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-secondary">
												{destination.count}
											</span>
										) : null}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<h2 className="mt-8 text-xs font-semibold uppercase tracking-widest text-text-secondary">
						Categories
					</h2>
					<ul className="mt-3 space-y-0.5">
						{categories.map((category) => (
							<li key={category}>
								<Link
									to="/reader"
									className="flex min-h-10 items-center rounded-md px-3 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
								>
									{category}
								</Link>
							</li>
						))}
					</ul>
				</aside>

				<section aria-labelledby="warming-heading" className="min-w-0 flex-1">
					<div className="rounded-lg border border-border-subtle bg-surface">
						<div className="border-b border-border-subtle px-6 py-5">
							<h2 id="warming-heading" className="text-lg font-medium text-text-primary">
								Your reading list is warming up
							</h2>
							<p className="mt-1 text-sm text-text-secondary">
								This is the Reader shell. Feed ingestion and the seeded Starter Pack land next, and
								items will stream in here with title, source, time, and excerpt.
							</p>
						</div>
						<ul aria-hidden="true" className="divide-y divide-border-subtle">
							{[0, 1, 2].map((row) => (
								<li key={row} className="flex gap-4 px-6 py-5">
									<span className="mt-1 size-5 shrink-0 rounded-full bg-bg-tertiary" />
									<span className="min-w-0 flex-1 space-y-2">
										<span className="block h-4 w-3/4 rounded-sm bg-bg-tertiary" />
										<span className="block h-3 w-1/3 rounded-sm bg-bg-tertiary" />
										<span className="block h-3 w-full rounded-sm bg-bg-tertiary" />
									</span>
								</li>
							))}
						</ul>
						<p
							role="status"
							className="border-t border-border-subtle px-6 py-4 text-xs text-text-secondary"
						>
							Waiting for the first feed fetch.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
