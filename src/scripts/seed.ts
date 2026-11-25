import { getDatabase } from "../db/client.server";
import { createDrizzleFeedStore } from "../feed/drizzle-store.server";
import { fetchFeed } from "../feed/fetch";
import { seedStarterPack } from "../feed/seed";

const store = createDrizzleFeedStore(getDatabase());
const result = await seedStarterPack(store, fetchFeed);

console.log(
	`Seeded ${result.feeds} of ${result.feeds + result.failures.length} Starter Pack feeds with ${result.items} items.`,
);

for (const failure of result.failures) {
	console.error(`Failed ${failure.url}: ${failure.error}`);
}

if (result.failures.length > 0) {
	process.exitCode = 1;
}
