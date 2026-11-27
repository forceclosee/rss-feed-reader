import { Link, useRouter } from "@tanstack/react-router";
import { AuthCard } from "#/components/auth-card";
import { useAppForm } from "#/components/form";
import { FormSubmit } from "#/components/form-controls";
import { authClient } from "#/lib/auth-client";
import { authErrorMessage } from "#/lib/auth-errors";
import { toast } from "#/lib/toast";
import {
	MINIMUM_PASSWORD_LENGTH,
	validateEmail,
	validateName,
	validatePassword,
} from "#/lib/validation";

interface SignUpPageProps {
	redirectTo?: string;
}

export function SignUpPage({ redirectTo }: SignUpPageProps) {
	const router = useRouter();

	const form = useAppForm({
		defaultValues: { name: "", email: "", password: "" },
		onSubmit: async ({ value }) => {
			try {
				const { error } = await authClient.signUp.email({
					name: value.name.trim(),
					email: value.email.trim(),
					password: value.password,
				});

				if (error) {
					toast.error("Account not created", {
						description: authErrorMessage(error, "That account could not be created."),
					});
					return;
				}
			} catch {
				toast.error("Account not created", {
					description: "The account service could not be reached. Try again.",
				});
				return;
			}

			toast.success("Account created", {
				description: `Welcome to Frontpage, ${value.name.trim()}.`,
			});
			await router.navigate({ href: redirectTo ?? "/reader" });
			await router.invalidate();
		},
	});

	return (
		<AuthCard
			title="Create your account"
			description="Start with the full Reader. Email verification is optional and can wait."
			footer={
				<>
					Already have an account?{" "}
					<Link
						to="/sign-in"
						search={{ redirect: redirectTo }}
						className="text-accent font-medium hover:underline">
						Sign in
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
					name="name"
					validators={{
						onBlur: ({ value }) => validateName(value),
						onSubmit: ({ value }) => validateName(value),
					}}>
					{(field) => (
						<field.TextField
							label="Display name"
							autoComplete="name"
							placeholder="Ada Lovelace"
							required
						/>
					)}
				</form.AppField>

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
						onBlur: ({ value }) => validatePassword(value),
						onSubmit: ({ value }) => validatePassword(value),
					}}>
					{(field) => (
						<field.PasswordField
							label="Password"
							description={`At least ${MINIMUM_PASSWORD_LENGTH} characters.`}
							autoComplete="new-password"
							required
						/>
					)}
				</form.AppField>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<FormSubmit
							isSubmitting={isSubmitting}
							idleLabel="Create account"
							pendingLabel="Creating account…"
						/>
					)}
				</form.Subscribe>
			</form>
		</AuthCard>
	);
}
