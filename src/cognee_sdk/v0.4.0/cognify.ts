import type { LocalCogneeClient } from "./client.ts";
import type { CognifyArgs } from "../types.ts";
import { logger } from "@/logger.ts";

const log = logger("local:v0.4.0:cognify");

/**
 * Process datasets into knowledge graphs on local Cognee instance (v0.4.0)
 * @param client - The local Cognee API client
 * @param args - Cognify operation arguments
 */
export const cognify = async (client: LocalCogneeClient, args: CognifyArgs) => {
	log("Calling local Cognee cognify API (v0.4.0)");

	const response = await client.POST("/api/v1/cognify", {
		body: {
			datasets: args.datasets ?? null,
			datasetIds: args.datasetIds ?? null,
			runInBackground: args.runInBackground ?? false,
			customPrompt: args.customPrompt ?? null,
		},
	});

	if (response.error) {
		throw new Error(`Failed to cognify: ${JSON.stringify(response.error)}`);
	}

	log("Cognify operation completed");
	return response.data;
};
