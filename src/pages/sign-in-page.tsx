import { Link, useRouter } from "@tanstack/react-router";
import { AuthCard } from "#/components/auth-card";
import { useAppForm } from "#/components/form";
import { FormSubmit } from "#/components/form-controls";
import { authClient } from "#/lib/auth-client";
import { authErrorMessage } from "#/lib/auth-errors";
import { toast } from "#/lib/toast";
import { validateEmail } from "#/lib/validation";

interface SignInPageProps {
	redirectTo?: string;
}

export function SignInPage({ redirectTo }: SignInPageProps) {
	const router = useRouter();

	const form = useAppForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			try {
				const { error } = await authClient.signIn.email({
					email: value.email.trim(),
					password: value.password,
				});

				if (error) {
					toast.error("Sign in failed", {
						description: authErrorMessage(error, "That email and password did not match."),
					});
					return;
				}
			} catch {
				toast.error("Sign in failed", {
					description: "The sign-in service could not be reached. Try again.",
				});
				return;
			}

			toast.success("Signed in", { description: "Welcome back to Frontpage." });
			await router.navigate({ href: redirectTo ?? "/account" });
			await router.invalidate();
		},
	});

	return (
		<AuthCard
			title="Welcome back"
			description="Sign in to keep your Reader, Read State, and Bookmarks in sync."
			footer={
				<>
					New to Frontpage?{" "}
					<Link
						to="/sign-up"
						search={{ redirect: redirectTo }}
						className="text-accent font-medium hover:underline">
						Create an account
					</Link>
				</>
			}>
			<form
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-5">
				<form.AppField
					name="email"
					validators={{
						onBlur: ({ value }) => validateEmail(value),
						onSubmit: ({ value }) => validateEmail(value),
					}}>
					{(field) => (
						<field.TextField
							label="Email"
							type="email"
							autoComplete="email"
							placeholder="you@example.com"
							required
						/>
					)}
				</form.AppField>

				<form.AppField
					name="password"
					validators={{
						onBlur: ({ value }) => (value ? undefined : "Enter your password."),
						onSubmit: ({ value }) => (value ? undefined : "Enter your password."),
					}}>
					{(field) => (
						<field.PasswordField label="Password" autoComplete="current-password" required />
					)}
				</form.AppField>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<FormSubmit
							isSubmitting={isSubmitting}
							idleLabel="Sign in"
							pendingLabel="Signing in…"
						/>
					)}
				</form.Subscribe>
			</form>
		</AuthCard>
	);
}
