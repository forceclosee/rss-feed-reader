import { describe, expect, it } from "vitest";
import { authErrorMessage } from "#/lib/auth-errors";

describe("authErrorMessage", () => {
	it("uses app copy for known Better Auth codes", () => {
		expect(authErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" }, "Something went wrong.")).toBe(
			"That email and password did not match.",
		);
		expect(authErrorMessage({ code: "USER_ALREADY_EXISTS" }, "Something went wrong.")).toBe(
			"An account with that email already exists. Try signing in instead.",
		);
	});

	it("falls back instead of showing provider messages", () => {
		expect(authErrorMessage({ code: "SOMETHING_NEW" }, "Something went wrong.")).toBe(
			"Something went wrong.",
		);
		expect(authErrorMessage(null, "Something went wrong.")).toBe("Something went wrong.");
	});
});
