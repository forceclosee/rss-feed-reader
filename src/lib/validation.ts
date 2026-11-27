const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MINIMUM_PASSWORD_LENGTH = 8;

export function validateName(value: string): string | undefined {
	if (!value.trim()) return "Enter your display name.";
	return undefined;
}

export function validateEmail(value: string): string | undefined {
	if (!value.trim()) return "Enter your email address.";
	if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
	return undefined;
}

export function validatePassword(value: string): string | undefined {
	if (!value) return "Enter a password.";
	if (value.length < MINIMUM_PASSWORD_LENGTH) {
		return `Use at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
	}
	return undefined;
}

/** Keeps post-auth redirects on this site, never an open redirect. */
export function safeRedirectPath(value: string | undefined): string | undefined {
	if (!value) return undefined;
	if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
		return undefined;
	}
	return value;
}
