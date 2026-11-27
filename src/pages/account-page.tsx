import { useRouter } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@ui-sdk/react/avatar";
import { Button } from "@ui-sdk/react/button";
import { useState } from "react";
import { ButtonLink } from "#/components/button-link";
import { buttonBaseClasses, buttonVariantClasses } from "#/components/button-styles";
import type { AuthSession } from "#/lib/auth.functions";
import { authClient } from "#/lib/auth-client";
import { authErrorMessage } from "#/lib/auth-errors";
import { cx } from "#/lib/cx";
import { firstLetter } from "#/lib/user";

interface AccountPageProps {
	session: AuthSession;
}

export function AccountPage({ session }: AccountPageProps) {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [signOutError, setSignOutError] = useState<string | null>(null);
	const { user } = session;

	const details = [
		{ label: "Display name", value: user.name },
		{ label: "Email", value: user.email },
		{ label: "Email status", value: user.emailVerified ? "Verified" : "Unverified" },
		{ label: "Plan", value: "Free" },
	];

	async function handleSignOut() {
		setIsSigningOut(true);
		setSignOutError(null);

		try {
			const { error } = await authClient.signOut();
			if (error) {
				setSignOutError(authErrorMessage(error, "You could not be signed out. Try again."));
				setIsSigningOut(false);
				return;
			}
		} catch {
			setSignOutError("The sign-out service could not be reached. Try again.");
			setIsSigningOut(false);
			return;
		}

		await router.navigate({ to: "/" });
		await router.invalidate();
	}

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
					Your identity, session controls, and reading preferences in one place.
				</p>
			</div>

			<section
				aria-labelledby="profile-heading"
				className="border-border-subtle bg-surface mt-8 max-w-(--content-max-width) rounded-lg border shadow-sm">
				<div className="border-border-subtle flex items-center gap-4 border-b px-6 py-5">
					<Avatar className="size-12 text-lg font-semibold">
						{user.image ? <AvatarImage src={user.image} alt="" /> : null}
						<AvatarFallback>
							<span aria-hidden="true">{firstLetter(user.name)}</span>
							<span data-slot="visually-hidden">{user.name}</span>
						</AvatarFallback>
					</Avatar>
					<div>
						<h2 id="profile-heading" className="text-text-primary text-base font-semibold">
							{user.name}
						</h2>
						<p className="text-text-secondary text-sm">{user.email}</p>
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
						onClick={() => void handleSignOut()}
						disabled={isSigningOut}
						className={cx(
							buttonBaseClasses,
							buttonVariantClasses.secondary,
							isSigningOut && "opacity-60",
						)}>
						{isSigningOut ? "Signing out…" : "Sign out"}
					</Button>
					{signOutError ? (
						<p role="alert" className="text-error text-sm">
							{signOutError}
						</p>
					) : null}
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
