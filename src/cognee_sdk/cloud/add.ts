import type { CloudCogneeClient } from "./client.ts";
import type { AddArgs } from "../types.ts";
import { logger } from "@/logger.ts";

const [log, logError] = [logger("cloud:add"), logger("cloud:add:error")];

/**
 * Add data to Cognee Cloud
 * @param client - The cloud client
 * @param args - Add operation arguments
 */
export const add = async (client: CloudCogneeClient, args: AddArgs) => {
	log("Calling Cognee Cloud API with:", {
		payloadLength: args.payload.length,
		datasetName: args.datasetName,
		datasetId: args.datasetId,
	});

	const response = await client.POST("/api/add", {
		body: {
			textData: args.payload,
			datasetName: args.datasetName ?? null,
			datasetId: args.datasetId ?? null,
			nodeSet: args.nodeSet ?? null,
		},
	});

	if (response.error) {
		logError("API error:", response.error);
		throw new Error(`Failed to add data: ${JSON.stringify(response.error)}`);
	}

	log("Data added successfully");
	return response.data;
};
