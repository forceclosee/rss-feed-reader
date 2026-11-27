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
	await expect(page).toHaveURL(/\/sign-in\?redirect=%2Faccount$/);
	await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
});

test("reader and account routes render when loaded directly", async ({ page }) => {
	await page.goto("/reader");
	await expect(page.getByRole("heading", { level: 1, name: "All Items" })).toBeVisible();
	await expect(page.getByRole("status")).toContainText(
		/newest \d+ items from \d+ feeds|Starter Pack is waiting|feed cache is temporarily unavailable/i,
	);

	await page.goto("/account");
	await expect(page).toHaveURL(/\/sign-in\?redirect=%2Faccount$/);
	await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
});

test("protected routes redirect signed-out visitors to sign in", async ({ page }) => {
	await page.goto("/account");

	await expect(page).toHaveURL(/\/sign-in\?redirect=%2Faccount$/);
	await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
	await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
	await expect(page.getByLabel("Password", { exact: true })).toBeVisible();

	await page.getByRole("link", { name: "Create an account" }).click();
	await expect(page).toHaveURL(/\/sign-up\?redirect=%2Faccount$/);
	await expect(page.getByRole("heading", { level: 1, name: "Create your account" })).toBeVisible();
	await expect(page.getByLabel("Display name")).toBeVisible();
});

test("the sign-up form validates before reaching the server", async ({ page }) => {
	await page.goto("/sign-up");
	await page.waitForLoadState("networkidle");

	await page.getByRole("button", { name: "Create account" }).click();

	await expect(page.getByText("Enter your display name.")).toBeVisible();
	await expect(page.getByText("Enter your email address.")).toBeVisible();
	await expect(page.getByText("Enter a password.")).toBeVisible();
});
