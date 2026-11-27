import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";
import { PasswordField, TextField } from "./form-fields";

export const { useAppForm } = createFormHook({
	fieldComponents: { TextField, PasswordField },
	formComponents: {},
	fieldContext,
	formContext,
});
