import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountPage } from "#/pages/account-page";
import { renderWithRouter } from "./render-with-router";

describe("AccountPage", () => {
	it("shows the account shell identity and settings", async () => {
		await renderWithRouter(<AccountPage />);

		expect(screen.getByRole("heading", { level: 1, name: "Account settings" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "Guest session" })).toBeInTheDocument();
		expect(screen.getByText("Not signed in")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Open reader" })).toHaveAttribute("href", "/reader");
		expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
		expect(
			screen.getByRole("heading", { level: 2, name: "Reading preferences" }),
		).toBeInTheDocument();
	});
});
