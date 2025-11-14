import type { CogneeSDK, AddArgs, CognifyArgs, SearchArgs } from "../types.ts";
import { createCloudRawClient, type CloudCogneeClient } from "./client.ts";
import { add as addImpl } from "./add.ts";
import { cognify as cognifyImpl } from "./cognify.ts";
import { search as searchImpl } from "./search.ts";
import { logger } from "@/logger.ts";

const log = logger("cloud-client");

/**
 * Creates a Cognee Cloud client implementing the CogneeSDK interface
 */
export const createCloudClient = (
	baseUrl: string,
	apiKey: string,
	headers?: Record<string, string>,
): CogneeSDK => {
	log("Creating Cognee Cloud client");
	const client = createCloudRawClient(baseUrl, apiKey, headers);

	return {
		add: (args: AddArgs) => addImpl(client, args),
		cognify: (args: CognifyArgs) => cognifyImpl(client, args),
		search: (args: SearchArgs) => searchImpl(client, args),
	};
};

export type { CloudCogneeClient };
export { createCloudRawClient };
