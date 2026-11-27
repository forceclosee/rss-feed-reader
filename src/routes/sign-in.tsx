import { createFileRoute, redirect } from "@tanstack/react-router";
import { safeRedirectPath } from "#/lib/validation";
import { SignInPage } from "#/pages/sign-in-page";

interface SignInSearch {
	redirect?: string;
}

export const Route = createFileRoute("/sign-in")({
	validateSearch: (search: Record<string, unknown>): SignInSearch => ({
		redirect: safeRedirectPath(typeof search.redirect === "string" ? search.redirect : undefined),
	}),
	beforeLoad: ({ context, search }) => {
		if (context.authSession) {
			throw redirect({ href: search.redirect ?? "/account" });
		}
	},
	head: () => ({
		meta: [{ title: "Sign in · Frontpage" }],
	}),
	component: SignInRoute,
});

function SignInRoute() {
	const { redirect: redirectTo } = Route.useSearch();
	return <SignInPage redirectTo={redirectTo} />;
}
