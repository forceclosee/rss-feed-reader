import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

export type Database = NeonHttpDatabase;

export function createDatabase(connectionString: string): Database {
	return drizzle({ client: neon(connectionString) });
}

let database: Database | undefined;

export function getDatabase(): Database {
	if (!database) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error("DATABASE_URL is not set. Add it to .dev.vars or .env.");
		}
		database = createDatabase(connectionString);
	}

	return database;
}
