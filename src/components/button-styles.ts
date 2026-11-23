export const buttonBaseClasses =
	"inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-semibold transition-colors";

export const buttonVariantClasses = {
	primary:
		"border-transparent bg-accent text-white hover:bg-accent-hover focus-visible:outline-accent",
	secondary:
		"border-border bg-surface text-text-primary shadow-sm hover:bg-bg-tertiary focus-visible:outline-accent",
} as const;

export type ButtonVariant = keyof typeof buttonVariantClasses;
