import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
		expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/sign-up");
	});

	it("renders three feature highlights", async () => {
		await renderWithRouter(<LandingPage />);

		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(
			screen.getByRole("heading", { level: 2, name: /built for people who read/i }),
		).toBeInTheDocument();
	});
});

describe("Try as Guest", () => {
	it("starts a guest session in sessionStorage when trying as guest", async () => {
		sessionStorage.clear();
		const { router } = await renderWithRouter(<LandingPage />);
		const navigateSpy = vi.spyOn(router, "navigate");

		fireEvent.click(screen.getByRole("link", { name: /try as guest/i }));

		expect(sessionStorage.getItem("frontpage:guest:active")).toBe("1");
		expect(sessionStorage.getItem("frontpage:guest:subscriptions")).not.toBeNull();
		expect(navigateSpy).toHaveBeenCalledWith({ to: "/reader" });
	});
});
