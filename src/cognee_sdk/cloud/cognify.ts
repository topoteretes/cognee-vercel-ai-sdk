import type { CloudCogneeClient } from "./client";
import type { CognifyArgs } from "../types";
import { logger } from "@/logger";

const log = logger("cloud:cognify");

/**
 * Process datasets into knowledge graphs on Cognee Cloud
 * @param client - The cloud client
 * @param args - Cognify operation arguments
 */
export const cognify = async (client: CloudCogneeClient, args: CognifyArgs) => {
	log("Calling Cognee Cloud cognify API");

	const response = await client.POST("/api/cognify", {
		body: {
			datasets: args.datasets ?? null,
			datasetIds: args.datasetIds ?? null,
			runInBackground:
				args.runInBackground === true ? false : (args.runInBackground ?? false),
			customPrompt: args.customPrompt ?? null,
			temporalCognify: args.temporalCognify ?? null,
		},
	});

	if (response.error) {
		throw new Error(`Failed to cognify: ${JSON.stringify(response.error)}`);
	}

	log("Cognify operation completed");
	return response.data;
};
