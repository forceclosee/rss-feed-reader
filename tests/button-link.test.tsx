import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ButtonLink } from "#/components/button-link";
import { renderWithRouter } from "./render-with-router";

describe("ButtonLink", () => {
	it("renders a ui-sdk button as a link with its href and label", async () => {
		await renderWithRouter(<ButtonLink to="/reader">Try as Guest</ButtonLink>);

		const link = screen.getByRole("link", { name: "Try as Guest" });
		expect(link).toHaveAttribute("href", "/reader");
		expect(link).toHaveAttribute("data-slot", "button");
	});

	it("keeps link semantics for every variant", async () => {
		await renderWithRouter(
			<ButtonLink to="/account" variant="secondary">
				Sign Up
			</ButtonLink>,
		);

		expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/account");
	});
});
