import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import {
	PasswordInput,
	PasswordInputControl,
	PasswordInputToggle,
} from "@ui-sdk/react/password-input";
import { Eye, EyeOff } from "lucide-react";
import type { HTMLInputTypeAttribute } from "react";
import { useFieldContext } from "./form-context";

/** Pulls the first human-readable message out of TanStack Form's error list. */
export function fieldErrorMessage(errors: unknown[]): string | undefined {
	for (const error of errors) {
		if (typeof error === "string" && error.length > 0) return error;
		if (
			error !== null &&
			typeof error === "object" &&
			"message" in error &&
			typeof error.message === "string" &&
			error.message.length > 0
		) {
			return error.message;
		}
	}

	return undefined;
}

interface TextFieldProps {
	label: string;
	description?: string;
	type?: HTMLInputTypeAttribute;
	autoComplete?: string;
	placeholder?: string;
	required?: boolean;
}

export function TextField({
	label,
	description,
	type = "text",
	autoComplete,
	placeholder,
	required,
}: TextFieldProps) {
	const field = useFieldContext<string>();
	const error = fieldErrorMessage(field.state.meta.errors);

	return (
		<Field name={field.name} invalid={error ? true : undefined}>
			<FieldLabel>{label}</FieldLabel>
			<Input
				type={type}
				autoComplete={autoComplete}
				placeholder={placeholder}
				required={required}
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
				onBlur={() => field.handleBlur()}
			/>
			{description ? <FieldDescription>{description}</FieldDescription> : null}
			{error ? <FieldError>{error}</FieldError> : null}
		</Field>
	);
}

interface PasswordFieldProps {
	label: string;
	description?: string;
	autoComplete?: "current-password" | "new-password";
	required?: boolean;
}

export function PasswordField({
	label,
	description,
	autoComplete = "current-password",
	required,
}: PasswordFieldProps) {
	const field = useFieldContext<string>();
	const error = fieldErrorMessage(field.state.meta.errors);

	return (
		<Field name={field.name} invalid={error ? true : undefined}>
			<FieldLabel>{label}</FieldLabel>
			<PasswordInput
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
				autoComplete={autoComplete}
				required={required}>
				<PasswordInputControl onBlur={() => field.handleBlur()} />
				<PasswordInputToggle aria-label="Show password">
					{(state) =>
						state.visible ? (
							<EyeOff aria-hidden="true" className="size-4" />
						) : (
							<Eye aria-hidden="true" className="size-4" />
						)
					}
				</PasswordInputToggle>
			</PasswordInput>
			{description ? <FieldDescription>{description}</FieldDescription> : null}
			{error ? <FieldError>{error}</FieldError> : null}
		</Field>
	);
}
