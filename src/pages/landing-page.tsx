import { Bookmark, Layers, Rss } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "#/components/button-link";
import { site } from "#/lib/site";

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
			<section className="mx-auto w-full max-w-(--page-max-width) px-4 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-24">
				<div className="max-w-(--content-max-width)">
					<p className="text-accent mb-4 text-xs font-semibold tracking-widest uppercase">
						RSS and Atom, calmly organized
					</p>
					<h1 className="text-text-primary text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
						{site.tagline}
					</h1>
					<p className="text-text-secondary mt-5 max-w-[38rem] text-lg leading-normal">
						{site.description}
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<ButtonLink to="/reader">Try as Guest</ButtonLink>
						<ButtonLink to="/account" variant="secondary">
							Sign Up
						</ButtonLink>
					</div>
					<p className="text-text-secondary mt-4 text-xs">
						No account needed to explore. Guest sessions start with a curated set of feeds.
					</p>
				</div>
			</section>

			<section
				aria-labelledby="features-heading"
				className="border-border-subtle bg-bg-secondary border-t">
				<div className="mx-auto w-full max-w-(--page-max-width) px-4 py-16 sm:px-6 sm:py-20">
					<h2
						id="features-heading"
						className="text-text-primary text-xl font-semibold tracking-tight">
						Built for people who read for a living
					</h2>
					<p className="text-text-secondary mt-2 max-w-(--content-max-width) text-sm">
						The information density of a power tool, with the calm of a good reading chair.
					</p>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<li
								key={feature.title}
								className="border-border-subtle bg-surface rounded-lg border p-6 shadow-sm">
								<span className="bg-accent-subtle text-accent flex size-10 items-center justify-center rounded-md">
									{feature.icon}
								</span>
								<h3 className="text-text-primary mt-4 text-base font-semibold">{feature.title}</h3>
								<p className="text-text-secondary mt-2 text-sm">{feature.description}</p>
							</li>
						))}
					</ul>
				</div>
			</section>
		</>
	);
}
