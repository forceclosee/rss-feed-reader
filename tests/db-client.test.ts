import { afterEach, describe, expect, it, vi } from "vitest";
import { createDatabase, getDatabase } from "@/db/client.server";

describe("database client", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("creates a Neon HTTP Drizzle client from a connection string", () => {
		const database = createDatabase("postgresql://user:password@example.com/frontpage");

		expect(database).toBeDefined();
	});

	it("explains how to configure a missing connection string", () => {
		vi.stubEnv("DATABASE_URL", "");

		expect(() => getDatabase()).toThrow(/DATABASE_URL is not set/);
	});
});
