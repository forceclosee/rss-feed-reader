import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppToaster } from "#/components/app-toaster";
import type { AuthSession } from "#/lib/auth.functions";
import { toast } from "#/lib/toast";
import { AccountPage } from "#/pages/account-page";
import { renderWithRouter } from "./render-with-router";

const authMocks = vi.hoisted(() => ({
	signOut: vi.fn(),
}));

vi.mock("#/lib/auth-client", () => ({
	authClient: {
		signOut: authMocks.signOut,
	},
}));

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

afterEach(() => {
	toast.dismiss();
	vi.clearAllMocks();
});

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

	it("shows a success toast after signing out", async () => {
		authMocks.signOut.mockResolvedValue({ data: { success: true }, error: null });
		await renderWithRouter(
			<>
				<AccountPage session={session} />
				<AppToaster />
			</>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

		expect(await screen.findByText("Signed out")).toBeInTheDocument();
		expect(screen.getByText("See you next time.")).toBeInTheDocument();
	});

	it("shows an error toast when signing out fails", async () => {
		authMocks.signOut.mockResolvedValue({ data: null, error: {} });
		await renderWithRouter(
			<>
				<AccountPage session={session} />
				<AppToaster />
			</>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

		expect(await screen.findByText("Sign out failed")).toBeInTheDocument();
		expect(screen.getByText("You could not be signed out. Try again.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
	});
});
