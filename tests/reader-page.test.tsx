import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { dismissSignUpPrompt, markGuestItemRead, startGuestSession } from "#/lib/guest";
import {
	formatFullDate,
	formatRelativeTime,
	type ReaderItem,
	ReaderPage,
} from "#/pages/reader-page";
import { renderWithRouter } from "./render-with-router";

afterEach(() => {
	sessionStorage.clear();
});

const items: ReaderItem[] = [
	{
		id: "item-2",
		title: "A newer story",
		url: "https://example.com/newer",
		author: "Jane Doe",
		publishedAt: "2024-02-02T09:00:00.000Z",
		excerpt: "The newer story excerpt.",
		feed: {
			id: "feed-1",
			title: "Example Blog",
			siteUrl: "https://example.com/",
			iconUrl: "https://example.com/icon.png",
		},
	},
	{
		id: "item-1",
		title: "An older story",
		url: null,
		author: null,
		publishedAt: "2024-01-15T10:30:00.000Z",
		excerpt: "The older story excerpt.",
		feed: {
			id: "feed-2",
			title: "Another Source",
			siteUrl: "https://another.example/",
			iconUrl: null,
		},
	},
];

describe("ReaderPage", () => {
	it("renders the reader heading, reading lists, and Starter Pack Categories", async () => {
		const { container } = await renderWithRouter(<ReaderPage items={items} />);

		expect(screen.getByRole("heading", { level: 1, name: "All Items" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Reading lists" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /frontend/i })).toHaveAttribute("href", "/reader");
		expect(screen.getByRole("link", { name: /backend & devops/i })).toBeInTheDocument();
		expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
	});

	it("shows each Item with its title, Feed, time, excerpt, and Feed icon", async () => {
		const { container } = await renderWithRouter(<ReaderPage items={items} />);

		const list = screen.getByRole("list", { name: "Items" });
		const rows = within(list).getAllByRole("listitem");
		expect(rows).toHaveLength(2);

		const first = within(rows[0] as HTMLElement);
		expect(first.getByRole("link", { name: "A newer story" })).toHaveAttribute(
			"href",
			"https://example.com/newer",
		);
		expect(first.getByText("Example Blog")).toBeInTheDocument();
		const time = container.querySelector('time[datetime="2024-02-02T09:00:00.000Z"]');
		expect(time).toHaveAttribute("title", expect.stringContaining("Feb 2, 2024"));
		expect(time).toHaveTextContent(/ago|just now/);
		expect(first.getByText("The newer story excerpt.")).toBeInTheDocument();
		expect(container.querySelector('img[src="https://example.com/icon.png"]')).toBeInTheDocument();

		const second = within(rows[1] as HTMLElement);
		expect(second.getByText("Another Source")).toBeInTheDocument();
		expect(second.getByText("A", { selector: "[data-feed-fallback]" })).toBeInTheDocument();
	});

	it("sorts Items newest first even when the data arrives out of order", async () => {
		const { container } = await renderWithRouter(<ReaderPage items={[...items].reverse()} />);

		const titles = [...container.querySelectorAll("[data-item-title]")].map(
			(element) => element.textContent,
		);
		expect(titles).toEqual(["A newer story", "An older story"]);
	});

	it("explains the empty state when no Items have been ingested yet", async () => {
		await renderWithRouter(<ReaderPage items={[]} />);

		expect(
			screen.getByRole("heading", { level: 3, name: /nothing here yet/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveTextContent(/starter pack/i);
	});

	it("explains when the shared feed cache is unavailable", async () => {
		await renderWithRouter(<ReaderPage items={[]} status="unavailable" />);

		expect(screen.getByRole("status")).toHaveTextContent(/temporarily unavailable/i);
	});

	it("formats timestamps relatively and exposes the full date on hover", () => {
		const now = Date.parse("2024-02-10T12:00:00.000Z");

		expect(formatRelativeTime("2024-02-10T11:00:00.000Z", now)).toBe("1h ago");
		expect(formatRelativeTime("2024-02-02T12:00:00.000Z", now)).toBe("1w ago");
		expect(formatRelativeTime("2023-02-10T12:00:00.000Z", now)).toBe("1y ago");
		expect(formatRelativeTime("2024-02-10T11:59:30.000Z", now)).toBe("just now");
		expect(formatRelativeTime("not a date", now)).toBe("Undated");
		expect(formatFullDate("2024-02-02T09:00:00.000Z")).toContain("Feb 2, 2024");
	});
});

describe("ReaderPage guest mode", () => {
	const items: ReaderItem[] = [
		{
			id: "item-1",
			title: "A guest story",
			url: "https://example.com/guest",
			author: "Jane Doe",
			publishedAt: "2024-02-02T09:00:00.000Z",
			excerpt: "The guest story excerpt.",
			feed: {
				id: "feed-1",
				title: "Example Blog",
				siteUrl: "https://example.com/",
				iconUrl: "https://example.com/icon.png",
			},
		},
		{
			id: "item-2",
			title: "Another guest story",
			url: null,
			author: null,
			publishedAt: "2024-01-15T10:30:00.000Z",
			excerpt: "Another guest story excerpt.",
			feed: {
				id: "feed-2",
				title: "Another Source",
				siteUrl: "https://another.example/",
				iconUrl: null,
			},
		},
	];

	it("shows the five Starter Pack category groups in the sidebar", async () => {
		startGuestSession({ items });
		await renderWithRouter(<ReaderPage items={items} isGuest />);

		expect(screen.getByRole("link", { name: /frontend/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /design/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /backend & devops/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /general tech/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /ai & ml/i })).toBeInTheDocument();
	});

	it("renders Items seeded into the guest session", async () => {
		startGuestSession({ items });
		await renderWithRouter(<ReaderPage items={items} isGuest />);

		const list = screen.getByRole("list", { name: "Items" });
		const rows = within(list).getAllByRole("listitem");
		expect(rows).toHaveLength(2);
		expect(within(rows[0] as HTMLElement).getByText("A guest story")).toBeInTheDocument();
		expect(within(rows[1] as HTMLElement).getByText("Another guest story")).toBeInTheDocument();
	});

	it("shows a gentle, dismissible sign-up prompt instead of gating exploration", async () => {
		startGuestSession({ items });
		await renderWithRouter(<ReaderPage items={items} isGuest />);

		expect(screen.getByText(/exploring as a guest/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /sign up to keep them/i })).toHaveAttribute(
			"href",
			"/sign-up",
		);

		fireEvent.click(screen.getByText(/maybe later/i));
		expect(screen.queryByText(/exploring as a guest/i)).not.toBeInTheDocument();
	});

	it("does not show the sign-up prompt once dismissed", async () => {
		dismissSignUpPrompt();
		await renderWithRouter(<ReaderPage items={items} isGuest />);

		expect(screen.queryByText(/exploring as a guest/i)).not.toBeInTheDocument();
	});

	it("visually de-emphasizes read items", async () => {
		startGuestSession({ items });
		markGuestItemRead("item-1", true);
		await renderWithRouter(<ReaderPage items={items} isGuest />);

		const list = screen.getByRole("list", { name: "Items" });
		const rows = within(list).getAllByRole("listitem");
		expect(rows[0]).toHaveClass("opacity-60");
		expect(rows[1]).not.toHaveClass("opacity-60");
	});
});
