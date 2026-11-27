import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignInPage } from "#/pages/sign-in-page";
import { SignUpPage } from "#/pages/sign-up-page";
import { renderWithRouter } from "./render-with-router";

describe("SignUpPage", () => {
	it("collects a display name, email, and password", async () => {
		await renderWithRouter(<SignUpPage />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Create your account" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Display name")).toHaveAttribute("autocomplete", "name");
		expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
		expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
	});

	it("shows validation messages when submitted empty", async () => {
		await renderWithRouter(<SignUpPage />);

		fireEvent.click(screen.getByRole("button", { name: "Create account" }));

		await waitFor(() => {
			expect(screen.getByText("Enter your display name.")).toBeInTheDocument();
		});
		expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
		expect(screen.getByText("Enter a password.")).toBeInTheDocument();
	});
});

describe("SignInPage", () => {
	it("collects an email and password", async () => {
		await renderWithRouter(<SignInPage />);

		expect(screen.getByRole("heading", { level: 1, name: "Welcome back" })).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
		expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
			"href",
			"/sign-up",
		);
	});
});
