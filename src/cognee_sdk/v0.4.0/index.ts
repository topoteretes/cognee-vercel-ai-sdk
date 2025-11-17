import type { CogneeSDK, AddArgs, CognifyArgs, SearchArgs } from "../types";
import { createLocalClient, type LocalCogneeClient } from "./client";
import { add as addImpl } from "./add";
import { cognify as cognifyImpl } from "./cognify";
import { search as searchImpl } from "./search";

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
