import type { CogneeSDK, AddArgs, CognifyArgs, SearchArgs } from "../types";
import { createCloudRawClient, type CloudCogneeClient } from "./client";
import { add as addImpl } from "./add";
import { cognify as cognifyImpl } from "./cognify";
import { search as searchImpl } from "./search";
import { logger } from "@/logger";

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
