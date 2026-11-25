import { expect, test } from "@playwright/test";

test("landing page links into the reader and account shells", async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", { level: 1, name: /personalized front page/i }),
	).toBeVisible();
	await expect(page).toHaveTitle(/Frontpage/);

	await page.getByRole("link", { name: "Reader" }).click();
	await expect(page).toHaveURL(/\/reader$/);
	await expect(page.getByRole("heading", { level: 1, name: "All Items" })).toBeVisible();

	await page.getByRole("link", { name: "Account" }).click();
	await expect(page).toHaveURL(/\/account$/);
	await expect(page.getByRole("heading", { level: 1, name: "Account settings" })).toBeVisible();
});

test("reader and account routes render when loaded directly", async ({ page }) => {
	await page.goto("/reader");
	await expect(page.getByRole("heading", { level: 1, name: "All Items" })).toBeVisible();
	await expect(page.getByRole("status")).toContainText(
		/newest \d+ items from \d+ feeds|Starter Pack is waiting|feed cache is temporarily unavailable/i,
	);

	await page.goto("/account");
	await expect(page.getByRole("heading", { level: 1, name: "Account settings" })).toBeVisible();
	await expect(page.getByRole("heading", { level: 2, name: "Guest session" })).toBeVisible();
});
