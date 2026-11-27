import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AuthSession } from "#/lib/auth.functions";
import { AccountPage } from "#/pages/account-page";
import { renderWithRouter } from "./render-with-router";

const session: AuthSession = {
	user: {
		id: "user-1",
		name: "Ada Lovelace",
		email: "ada@example.com",
		emailVerified: false,
		image: null,
	},
	session: {
		id: "session-1",
		expiresAt: new Date("2030-01-01T00:00:00.000Z"),
	},
};

describe("AccountPage", () => {
	it("shows the signed-in User's name, email, first-letter avatar, and sign out action", async () => {
		await renderWithRouter(<AccountPage session={session} />);

		expect(screen.getByRole("heading", { level: 1, name: "Account settings" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "Ada Lovelace" })).toBeInTheDocument();
		expect(screen.getAllByText("ada@example.com")).toHaveLength(2);
		expect(screen.getByText("A", { selector: "span[aria-hidden='true']" })).toBeInTheDocument();
		expect(screen.getByText("Unverified")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Open reader" })).toHaveAttribute("href", "/reader");
		expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { level: 2, name: "Reading preferences" }),
		).toBeInTheDocument();
	});

	it("shows a verified email status when the User has verified their address", async () => {
		await renderWithRouter(
			<AccountPage session={{ ...session, user: { ...session.user, emailVerified: true } }} />,
		);

		expect(screen.getByText("Verified")).toBeInTheDocument();
	});
});
