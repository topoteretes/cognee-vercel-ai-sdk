import type { CogneeSDK, AddArgs, CognifyArgs, SearchArgs } from "../types.ts";
import { createLocalClient, type LocalCogneeClient } from "./client.ts";
import { add as addImpl } from "./add.ts";
import { cognify as cognifyImpl } from "./cognify.ts";
import { search as searchImpl } from "./search.ts";

/**
 * Creates a local Cognee SDK implementation for v0.4.0
 */
export const createV040SDK = (baseUrl: string, apiKey?: string): CogneeSDK => {
	const client = createLocalClient(baseUrl, apiKey);

	return {
		add: (args: AddArgs) => addImpl(client, args),
		cognify: (args: CognifyArgs) => cognifyImpl(client, args),
		search: (args: SearchArgs) => searchImpl(client, args),
	};
};

export type { LocalCogneeClient };
export { createLocalClient };
