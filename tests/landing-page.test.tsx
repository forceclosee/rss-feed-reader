import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "#/pages/landing-page";
import { renderWithRouter } from "./render-with-router";

describe("LandingPage", () => {
	it("states the value proposition and offers both entry points", async () => {
		await renderWithRouter(<LandingPage />);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: /personalized front page for tech content/i,
			}),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /try as guest/i })).toHaveAttribute("href", "/reader");
		expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/account");
	});

	it("renders three feature highlights", async () => {
		await renderWithRouter(<LandingPage />);

		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(
			screen.getByRole("heading", { level: 2, name: /built for people who read/i }),
		).toBeInTheDocument();
	});
});
