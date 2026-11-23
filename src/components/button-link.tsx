import { Link, type LinkProps } from "@tanstack/react-router";
import { Button } from "@ui-sdk/react/button";
import type { ReactNode } from "react";
import { cx } from "#/lib/cx";
import { type ButtonVariant, buttonBaseClasses, buttonVariantClasses } from "./button-styles";

type ButtonLinkProps = {
	to: LinkProps["to"];
	children: ReactNode;
	variant?: ButtonVariant;
	className?: string;
};

export function ButtonLink({ to, children, variant = "primary", className }: ButtonLinkProps) {
	return (
		<Button
			render={<Link to={to} />}
			className={cx(buttonBaseClasses, buttonVariantClasses[variant], className)}
		>
			{children}
		</Button>
	);
}
