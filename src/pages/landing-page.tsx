import { Bookmark, Layers, Rss } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/button-link";
import { site } from "@/lib/site";

type Feature = {
	title: string;
	description: string;
	icon: ReactNode;
};

const features: Feature[] = [
	{
		title: "Everything in one place",
		description:
			"Pull RSS and Atom feeds from blogs, newsletters, changelogs, and publications into a single reading list.",
		icon: <Rss aria-hidden="true" className="size-5" />,
	},
	{
		title: "Your categories, your pace",
		description:
			"Group sources into the categories you think in, then filter down to exactly what you have time for.",
		icon: <Layers aria-hidden="true" className="size-5" />,
	},
	{
		title: "Read now, save for later",
		description:
			"Keep unread counts honest, mark items as read, and bookmark the pieces worth returning to.",
		icon: <Bookmark aria-hidden="true" className="size-5" />,
	},
];

export function LandingPage() {
	return (
		<>
			<section className="mx-auto w-full max-w-(--page-max-width) px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
				<div className="max-w-(--content-max-width)">
					<p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
						RSS and Atom, calmly organized
					</p>
					<h1 className="text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
						{site.tagline}
					</h1>
					<p className="mt-5 max-w-[38rem] text-lg leading-normal text-text-secondary">
						{site.description}
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<ButtonLink to="/reader">Try as Guest</ButtonLink>
						<ButtonLink to="/account" variant="secondary">
							Sign Up
						</ButtonLink>
					</div>
					<p className="mt-4 text-xs text-text-secondary">
						No account needed to explore. Guest sessions start with a curated set of feeds.
					</p>
				</div>
			</section>

			<section
				aria-labelledby="features-heading"
				className="border-t border-border-subtle bg-bg-secondary"
			>
				<div className="mx-auto w-full max-w-(--page-max-width) px-4 py-16 sm:px-6 sm:py-20">
					<h2
						id="features-heading"
						className="text-xl font-semibold tracking-tight text-text-primary"
					>
						Built for people who read for a living
					</h2>
					<p className="mt-2 max-w-(--content-max-width) text-sm text-text-secondary">
						The information density of a power tool, with the calm of a good reading chair.
					</p>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<li
								key={feature.title}
								className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm"
							>
								<span className="flex size-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
									{feature.icon}
								</span>
								<h3 className="mt-4 text-base font-semibold text-text-primary">{feature.title}</h3>
								<p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
							</li>
						))}
					</ul>
				</div>
			</section>
		</>
	);
}
