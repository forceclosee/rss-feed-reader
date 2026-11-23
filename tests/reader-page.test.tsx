import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReaderPage } from "@/pages/reader-page";
import { renderWithRouter } from "./render-with-router";

describe("ReaderPage", () => {
	it("renders the reader heading and its reading lists", async () => {
		await renderWithRouter(<ReaderPage />);

		expect(screen.getByRole("heading", { level: 1, name: "All Items" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Reading lists" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /frontend/i })).toHaveAttribute("href", "/reader");
	});

	it("shows the shell's waiting state", async () => {
		await renderWithRouter(<ReaderPage />);

		expect(screen.getByRole("status")).toHaveTextContent("Waiting for the first feed fetch.");
		expect(
			screen.getByRole("heading", { level: 2, name: /reading list is warming up/i }),
		).toBeInTheDocument();
	});
});
