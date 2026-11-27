import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppToaster } from "#/components/app-toaster";
import { toast } from "#/lib/toast";
import { SignInPage } from "#/pages/sign-in-page";
import { SignUpPage } from "#/pages/sign-up-page";
import { renderWithRouter } from "./render-with-router";

const authMocks = vi.hoisted(() => ({
	signUpEmail: vi.fn(),
	signInEmail: vi.fn(),
	signOut: vi.fn(),
}));

vi.mock("#/lib/auth-client", () => ({
	authClient: {
		signUp: { email: authMocks.signUpEmail },
		signIn: { email: authMocks.signInEmail },
		signOut: authMocks.signOut,
	},
}));

afterEach(() => {
	toast.dismiss();
	vi.clearAllMocks();
});

function fillSignUpForm() {
	fireEvent.input(screen.getByLabelText("Display name"), {
		target: { value: "Ada Lovelace" },
	});
	fireEvent.input(screen.getByLabelText("Email"), {
		target: { value: "ada@example.com" },
	});
	fireEvent.input(screen.getByLabelText("Password"), {
		target: { value: "correct-horse-battery" },
	});
}

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

	it("shows a success toast after creating an account", async () => {
		authMocks.signUpEmail.mockResolvedValue({ data: { user: {} }, error: null });
		await renderWithRouter(
			<>
				<SignUpPage />
				<AppToaster />
			</>,
			{ paths: ["/reader"] },
		);

		fillSignUpForm();
		fireEvent.click(screen.getByRole("button", { name: "Create account" }));

		expect(await screen.findByText("Account created")).toBeInTheDocument();
		expect(screen.getByText("Welcome to Frontpage, Ada Lovelace.")).toBeInTheDocument();
	});

	it("shows an error toast when the account cannot be created", async () => {
		authMocks.signUpEmail.mockResolvedValue({
			data: null,
			error: { code: "USER_ALREADY_EXISTS" },
		});
		await renderWithRouter(
			<>
				<SignUpPage />
				<AppToaster />
			</>,
			{ paths: ["/reader"] },
		);

		fillSignUpForm();
		fireEvent.click(screen.getByRole("button", { name: "Create account" }));

		expect(await screen.findByText("Account not created")).toBeInTheDocument();
		expect(
			screen.getByText("An account with that email already exists. Try signing in instead."),
		).toBeInTheDocument();
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

	it("shows a success toast after signing in", async () => {
		authMocks.signInEmail.mockResolvedValue({ data: { user: {} }, error: null });
		await renderWithRouter(
			<>
				<SignInPage />
				<AppToaster />
			</>,
			{ paths: ["/account"] },
		);

		fireEvent.input(screen.getByLabelText("Email"), {
			target: { value: "ada@example.com" },
		});
		fireEvent.input(screen.getByLabelText("Password"), {
			target: { value: "correct-horse-battery" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

		expect(await screen.findByText("Signed in")).toBeInTheDocument();
		expect(screen.getByText("Welcome back to Frontpage.")).toBeInTheDocument();
	});

	it("shows an error toast when the credentials do not match", async () => {
		authMocks.signInEmail.mockResolvedValue({
			data: null,
			error: { code: "INVALID_EMAIL_OR_PASSWORD" },
		});
		await renderWithRouter(
			<>
				<SignInPage />
				<AppToaster />
			</>,
			{ paths: ["/account"] },
		);

		fireEvent.input(screen.getByLabelText("Email"), {
			target: { value: "ada@example.com" },
		});
		fireEvent.input(screen.getByLabelText("Password"), {
			target: { value: "wrong-password" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

		expect(await screen.findByText("Sign in failed")).toBeInTheDocument();
		expect(screen.getByText("That email and password did not match.")).toBeInTheDocument();
	});
});
