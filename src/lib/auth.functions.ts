import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getAuth } from "./auth";

export interface AuthSessionUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
}

export interface AuthSession {
	user: AuthSessionUser;
	session: {
		id: string;
		expiresAt: Date;
	};
}

/**
 * Reads the signed-in User from the session cookie. Missing or unreachable
 * session storage is treated as signed out so public routes keep rendering.
 */
export const getSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthSession | null> => {
		// Public pages must render even when the database is not configured.
		if (!process.env.DATABASE_URL) return null;

		try {
			const result = await getAuth().api.getSession({ headers: getRequestHeaders() });
			if (!result) return null;

			return {
				user: {
					id: result.user.id,
					name: result.user.name,
					email: result.user.email,
					emailVerified: result.user.emailVerified,
					image: result.user.image ?? null,
				},
				session: {
					id: result.session.id,
					expiresAt: result.session.expiresAt,
				},
			};
		} catch (error) {
			console.error("The current session could not be read.", error);
			return null;
		}
	},
);
