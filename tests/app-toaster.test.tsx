import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppToaster } from "#/components/app-toaster";
import { toast } from "#/lib/toast";

afterEach(() => {
	toast.dismiss();
});

describe("AppToaster", () => {
	it("shows success and error notifications with the matching type", async () => {
		render(<AppToaster />);

		act(() => {
			toast.success("Account created", { description: "Welcome to Frontpage." });
		});

		expect(await screen.findByText("Account created")).toBeInTheDocument();
		expect(screen.getByText("Welcome to Frontpage.")).toBeInTheDocument();
		const successToast = screen
			.getByText("Account created")
			.closest('[data-slot="toast"]') as HTMLElement;
		expect(successToast).toHaveAttribute("data-type", "success");

		act(() => {
			toast.error("Sign in failed", { description: "That email and password did not match." });
		});

		expect(await screen.findByText("Sign in failed")).toBeInTheDocument();
		expect(screen.getByText("That email and password did not match.")).toBeInTheDocument();
		const errorToast = screen
			.getByText("Sign in failed")
			.closest('[data-slot="toast"]') as HTMLElement;
		expect(errorToast).toHaveAttribute("data-type", "error");
	});

	it("lets someone dismiss a notification", async () => {
		render(<AppToaster />);

		act(() => {
			toast.success("Account created");
		});

		const successToast = (await screen.findByText("Account created")).closest(
			'[data-slot="toast"]',
		) as HTMLElement;
		fireEvent.click(within(successToast).getByRole("button", { name: "Dismiss notification" }));

		await waitFor(() => {
			expect(screen.queryByText("Account created")).not.toBeInTheDocument();
		});
	});
});
