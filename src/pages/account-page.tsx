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
				<p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
					Account
				</p>
				<h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
					Account settings
				</h1>
				<p className="mt-3 text-sm text-text-secondary">
					Authentication arrives in the next milestone. Until then this page shows the shape of the
					account area: identity, preferences, and session controls.
				</p>
			</div>

			<section
				aria-labelledby="profile-heading"
				className="mt-8 max-w-(--content-max-width) rounded-lg border border-border-subtle bg-surface shadow-sm"
			>
				<div className="flex items-center gap-4 border-b border-border-subtle px-6 py-5">
					<span
						aria-hidden="true"
						className="flex size-12 items-center justify-center rounded-full bg-accent-subtle text-lg font-semibold text-accent"
					>
						G
					</span>
					<div>
						<h2 id="profile-heading" className="text-base font-semibold text-text-primary">
							Guest session
						</h2>
						<p className="text-sm text-text-secondary">
							Your feeds and reading state are scoped to this browser session.
						</p>
					</div>
				</div>

				<dl className="divide-y divide-border-subtle">
					{details.map((detail) => (
						<div
							key={detail.label}
							className="flex flex-wrap items-center justify-between gap-2 px-6 py-3"
						>
							<dt className="text-sm text-text-secondary">{detail.label}</dt>
							<dd className="text-sm font-medium text-text-primary">{detail.value}</dd>
						</div>
					))}
				</dl>

				<div className="flex flex-wrap items-center gap-3 border-t border-border-subtle px-6 py-4">
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
						)}
					>
						Sign in
					</Button>
					<p id="sign-in-note" className="text-xs text-text-secondary">
						Email and password sign-in is coming soon.
					</p>
				</div>
			</section>

			<section
				aria-labelledby="preferences-heading"
				className="mt-6 max-w-(--content-max-width) rounded-lg border border-border-subtle bg-surface p-6 shadow-sm"
			>
				<h2 id="preferences-heading" className="text-base font-semibold text-text-primary">
					Reading preferences
				</h2>
				<p className="mt-2 text-sm text-text-secondary">
					Layout, theme, refresh interval, and reading typography will live here once guest state
					and user preferences are wired.
				</p>
			</section>
		</div>
	);
}
