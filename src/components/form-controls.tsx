import { Button } from "@ui-sdk/react/button";
import { cx } from "#/lib/cx";
import { buttonBaseClasses, buttonVariantClasses } from "./button-styles";

interface FormSubmitProps {
	isSubmitting: boolean;
	idleLabel: string;
	pendingLabel: string;
}

export function FormSubmit({ isSubmitting, idleLabel, pendingLabel }: FormSubmitProps) {
	return (
		<Button
			type="submit"
			disabled={isSubmitting}
			className={cx(
				buttonBaseClasses,
				buttonVariantClasses.primary,
				"w-full",
				isSubmitting && "opacity-60",
			)}>
			{isSubmitting ? pendingLabel : idleLabel}
		</Button>
	);
}
