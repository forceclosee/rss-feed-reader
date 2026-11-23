import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { feeds, items } from "@/db/schema";

describe("shared feed cache schema", () => {
	it("maps the feeds and items tables", () => {
		expect(getTableName(feeds)).toBe("feeds");
		expect(getTableName(items)).toBe("items");
	});
});
