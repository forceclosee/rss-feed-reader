import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountPage } from "#/pages/account-page";

export const Route = createFileRoute("/account")({
	beforeLoad: ({ context, location }) => {
		if (!context.authSession) {
			throw redirect({
				to: "/sign-in",
				search: { redirect: location.href },
			});
		}

		return { authSession: context.authSession };
	},
	head: () => ({
		meta: [{ title: "Account · Frontpage" }],
	}),
	component: AccountRoute,
});

function AccountRoute() {
	const { authSession } = Route.useRouteContext();
	return <AccountPage session={authSession} />;
}
