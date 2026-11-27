// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createAuth } from "#/lib/auth";

const PASSWORD = "correct-horse-battery";

let client: PGlite;
let auth: ReturnType<typeof createAuth>;

beforeAll(async () => {
	client = new PGlite();

	const drizzleDirectory = join(process.cwd(), "drizzle");
	const migrationDirectories = readdirSync(drizzleDirectory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

	for (const directory of migrationDirectories) {
		const migration = readFileSync(join(drizzleDirectory, directory, "migration.sql"), "utf8");
		await client.exec(migration);
	}

	auth = createAuth(drizzle({ client }));
}, 30_000);

afterAll(async () => {
	await client.close();
});

function cookieFrom(headers: Headers): string {
	const setCookie = headers.get("set-cookie");
	if (!setCookie) throw new Error("Better Auth did not set a session cookie.");
	return setCookie.split(";")[0] ?? setCookie;
}

function uniqueEmail(label: string): string {
	return `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function signUp(email: string, name = "Ada Lovelace") {
	const { headers, response } = await auth.api.signUpEmail({
		body: { name, email, password: PASSWORD },
		returnHeaders: true,
	});

	return { cookie: cookieFrom(headers), user: response.user };
}

describe("Better Auth email and password", () => {
	it("creates an unverified account and an authenticated session on sign up", async () => {
		const email = uniqueEmail("sign-up");
		const { cookie, user } = await signUp(email);

		expect(user.email).toBe(email);
		expect(user.name).toBe("Ada Lovelace");
		expect(user.emailVerified).toBe(false);

		const session = await auth.api.getSession({
			headers: new Headers({ cookie }),
		});

		expect(session?.user.id).toBe(user.id);
		expect(session?.user.email).toBe(email);
		expect(session?.user.emailVerified).toBe(false);
	});

	it("signs back in with the same email and password after signing out", async () => {
		const email = uniqueEmail("sign-in");
		const { cookie, user } = await signUp(email);

		await auth.api.signOut({ headers: new Headers({ cookie }) });

		const signedOutSession = await auth.api.getSession({
			headers: new Headers({ cookie }),
		});
		expect(signedOutSession).toBeNull();

		const { headers } = await auth.api.signInEmail({
			body: { email, password: PASSWORD },
			returnHeaders: true,
		});

		const session = await auth.api.getSession({
			headers: new Headers({ cookie: cookieFrom(headers) }),
		});
		expect(session?.user.id).toBe(user.id);
	});

	it("rejects a sign in with the wrong password", async () => {
		const email = uniqueEmail("wrong-password");
		await signUp(email);

		await expect(
			auth.api.signInEmail({
				body: { email, password: "not-the-right-password" },
			}),
		).rejects.toThrow();
	});

	it("returns a session for an unverified User", async () => {
		const email = uniqueEmail("unverified");
		const { cookie, user } = await signUp(email);

		expect(user.emailVerified).toBe(false);

		const session = await auth.api.getSession({
			headers: new Headers({ cookie }),
		});
		expect(session?.user.emailVerified).toBe(false);
	});
});
