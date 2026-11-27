import { describe, expect, it } from "vitest";
import {
	MINIMUM_PASSWORD_LENGTH,
	safeRedirectPath,
	validateEmail,
	validateName,
	validatePassword,
} from "#/lib/validation";

describe("auth form validation", () => {
	it("requires a display name and a valid email", () => {
		expect(validateName("  ")).toBe("Enter your display name.");
		expect(validateName("Ada Lovelace")).toBeUndefined();
		expect(validateEmail("")).toBe("Enter your email address.");
		expect(validateEmail("not-an-email")).toBe("Enter a valid email address.");
		expect(validateEmail("ada@example.com")).toBeUndefined();
	});

	it("requires a password with the minimum length", () => {
		expect(validatePassword("")).toBe("Enter a password.");
		expect(validatePassword("short")).toBe(`Use at least ${MINIMUM_PASSWORD_LENGTH} characters.`);
		expect(validatePassword("long-enough-password")).toBeUndefined();
	});
});

describe("safeRedirectPath", () => {
	it("keeps paths on this site", () => {
		expect(safeRedirectPath("/account")).toBe("/account");
		expect(safeRedirectPath("/reader?category=frontend")).toBe("/reader?category=frontend");
	});

	it("rejects missing, external, and protocol-relative redirects", () => {
		expect(safeRedirectPath(undefined)).toBeUndefined();
		expect(safeRedirectPath("https://example.com")).toBeUndefined();
		expect(safeRedirectPath("//example.com")).toBeUndefined();
		expect(safeRedirectPath("/\\example.com")).toBeUndefined();
	});
});
