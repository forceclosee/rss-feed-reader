import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../db/client.server";
import type { ReaderItem, ReaderStatus } from "../feed/reader";
import { getReaderItems } from "../feed/reader.server";

export interface ReaderLoaderData {
	items: ReaderItem[];
	status: ReaderStatus;
}

export const loadReader = createServerFn({ method: "GET" }).handler(
	async (): Promise<ReaderLoaderData> => {
		try {
			const items = await getReaderItems(getDatabase());
			return { items, status: items.length > 0 ? "ready" : "empty" };
		} catch (error) {
			console.error("The shared feed cache could not be read.", error);
			return { items: [], status: "unavailable" };
		}
	},
);
