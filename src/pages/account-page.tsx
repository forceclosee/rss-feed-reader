import { Button } from "@ui-sdk/react/button";
import { ButtonLink } from "#/components/button-link";
import { buttonBaseClasses, buttonVariantClasses } from "#/components/button-styles";
import { cx } from "#/lib/cx";

const details = [
	{ label: "Display name", value: "Guest" },
	{ label: "Email", value: "Not signed in" },
	{ label: "Plan", value: "Free" },
];

export function AccountPage() {
	return (
		<div className="mx-auto w-full max-w-(--page-max-width) px-4 py-10 sm:px-6 sm:py-14">
			<div className="max-w-(--content-max-width)">
				<p className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
					Account
				</p>
				<h1 className="text-text-primary mt-1 text-xl font-semibold tracking-tight">
					Account settings
				</h1>
				<p className="text-text-secondary mt-3 text-sm">
					Authentication arrives in the next milestone. Until then this page shows the shape of the
					account area: identity, preferences, and session controls.
				</p>
			</div>

			<section
				aria-labelledby="profile-heading"
				className="border-border-subtle bg-surface mt-8 max-w-(--content-max-width) rounded-lg border shadow-sm">
				<div className="border-border-subtle flex items-center gap-4 border-b px-6 py-5">
					<span
						aria-hidden="true"
						className="bg-accent-subtle text-accent flex size-12 items-center justify-center rounded-full text-lg font-semibold">
						G
					</span>
					<div>
						<h2 id="profile-heading" className="text-text-primary text-base font-semibold">
							Guest session
						</h2>
						<p className="text-text-secondary text-sm">
							Your feeds and reading state are scoped to this browser session.
						</p>
					</div>
				</div>

				<dl className="divide-border-subtle divide-y">
					{details.map((detail) => (
						<div
							key={detail.label}
							className="flex flex-wrap items-center justify-between gap-2 px-6 py-3">
							<dt className="text-text-secondary text-sm">{detail.label}</dt>
							<dd className="text-text-primary text-sm font-medium">{detail.value}</dd>
						</div>
					))}
				</dl>

				<div className="border-border-subtle flex flex-wrap items-center gap-3 border-t px-6 py-4">
					<ButtonLink to="/reader" variant="secondary">
						Open reader
					</ButtonLink>
					<Button
						disabled
						aria-describedby="sign-in-note"
						className={cx(
							buttonBaseClasses,
							buttonVariantClasses.secondary,
							"cursor-not-allowed opacity-60",
						)}>
						Sign in
					</Button>
					<p id="sign-in-note" className="text-text-secondary text-xs">
						Email and password sign-in is coming soon.
					</p>
				</div>
			</section>

			<section
				aria-labelledby="preferences-heading"
				className="border-border-subtle bg-surface mt-6 max-w-(--content-max-width) rounded-lg border p-6 shadow-sm">
				<h2 id="preferences-heading" className="text-text-primary text-base font-semibold">
					Reading preferences
				</h2>
				<p className="text-text-secondary mt-2 text-sm">
					Layout, theme, refresh interval, and reading typography will live here once guest state
					and user preferences are wired.
				</p>
			</section>
		</div>
	);
}
