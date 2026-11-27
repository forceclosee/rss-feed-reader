import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDatabase } from "#/db/client.server";
import * as schema from "#/db/schema";

/**
 * Any Drizzle database the auth adapter can query. Keeping this structural
 * lets tests run Better Auth against an in-memory Postgres (PGlite) while
 * production uses Neon.
 */
type AuthDatabase = Parameters<typeof drizzleAdapter>[0];

/**
 * Builds a Better Auth instance around a Drizzle database. Exported separately
 * from `getAuth` so tests can point auth at an in-memory Postgres database.
 */
export function createAuth(db: AuthDatabase) {
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
			// Accounts are usable without verification. Verifying ownership is
			// only required for changing email or deleting an account.
			requireEmailVerification: false,
		},
		plugins: [tanstackStartCookies()],
	});
}

export type Auth = ReturnType<typeof createAuth>;

let auth: Auth | undefined;

/** Returns the process-wide Better Auth instance, creating it on first use. */
export function getAuth(): Auth {
	auth ??= createAuth(getDatabase());
	return auth;
}
