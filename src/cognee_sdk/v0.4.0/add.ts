import type { LocalCogneeClient } from "./client.ts";
import type { AddArgs } from "../types.ts";
import { logger } from "@/logger.ts";

const [log, logError] = [
	logger("local:v0.4.0:add"),
	logger("local:v0.4.0:add:error"),
];

/**
 * Add text data to local Cognee instance (v0.4.0)
 * @param client - The local Cognee API client
 * @param args - Add operation arguments
 */
export const add = async (client: LocalCogneeClient, args: AddArgs) => {
	log("Calling local Cognee API (v0.4.0) with:", {
		payloadLength: args.payload.length,
		datasetName: args.datasetName,
		datasetId: args.datasetId,
	});

	const response = await client.POST("/api/v1/add", {
		body: {
			data: args.payload,
			datasetName: args.datasetName ?? null,
			datasetId: args.datasetId ?? null,
			node_set: args.nodeSet ?? null,
		},
	});

	if (response.error) {
		logError("API error:", response.error);
		throw new Error(`Failed to add data: ${JSON.stringify(response.error)}`);
	}

	log("Data added successfully");
	return response.data;
};
