import { createFileRoute, redirect } from "@tanstack/react-router";
import { safeRedirectPath } from "#/lib/validation";
import { SignUpPage } from "#/pages/sign-up-page";

interface SignUpSearch {
	redirect?: string;
}

export const Route = createFileRoute("/sign-up")({
	validateSearch: (search: Record<string, unknown>): SignUpSearch => ({
		redirect: safeRedirectPath(typeof search.redirect === "string" ? search.redirect : undefined),
	}),
	beforeLoad: ({ context, search }) => {
		if (context.authSession) {
			throw redirect({ href: search.redirect ?? "/account" });
		}
	},
	head: () => ({
		meta: [{ title: "Create account · Frontpage" }],
	}),
	component: SignUpRoute,
});

function SignUpRoute() {
	const { redirect: redirectTo } = Route.useSearch();
	return <SignUpPage redirectTo={redirectTo} />;
}
