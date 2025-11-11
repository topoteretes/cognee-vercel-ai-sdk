import type { CogneeClient } from "../cognee_sdk/client.ts";

interface AddTextOptions {
	textData: string[];
	datasetName?: string | null;
	datasetId?: string | null;
	nodeSet?: string[] | null;
}

import { logger } from "@/logger.ts";

const [log, logError] = [logger("add-tool"), logger("add-tool:error")];

/**
 * Add text data to Cognee for processing
 * @param client - The Cognee API client
 * @param options - Text data and dataset options
 */
export const add = async (client: CogneeClient, options: AddTextOptions) => {
	log("Calling Cognee API with:", {
		textDataLength: options.textData.length,
		datasetName: options.datasetName,
		datasetId: options.datasetId,
	});

	const response = await client.POST("/api/add", {
		body: {
			textData: options.textData,
			datasetName: options.datasetName ?? null,
			datasetId: options.datasetId ?? null,
			nodeSet: options.nodeSet ?? null,
		},
	});

	if (response.error) {
		logError("API error:", response.error);
		throw new Error(`Failed to add text: ${JSON.stringify(response.error)}`);
	}

	log("API response received");
	return response.data;
};
