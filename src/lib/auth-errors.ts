/**
 * Maps Better Auth error codes to app-owned copy. Provider messages can change
 * or expose implementation details, so they never reach the screen.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
	EMAIL_NOT_VERIFIED: "Verify your email before signing in.",
	INVALID_EMAIL: "Enter a valid email address.",
	INVALID_EMAIL_OR_PASSWORD: "That email and password did not match.",
	PASSWORD_TOO_LONG: "Use a shorter password.",
	PASSWORD_TOO_SHORT: "Use a longer password.",
	USER_ALREADY_EXISTS: "An account with that email already exists. Try signing in instead.",
	USER_NOT_FOUND: "That email and password did not match.",
};

export function authErrorMessage(
	error: { code?: string | undefined } | null | undefined,
	fallback: string,
): string {
	return (error?.code ? AUTH_ERROR_MESSAGES[error.code] : undefined) ?? fallback;
}
