import type { LocalCogneeClient } from "./client";
import type { AddArgs } from "../types";
import { logger } from "@/logger";

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

	// v0.4.0 API expects multipart/form-data
	const formData = new FormData();

	args.payload.forEach((text, index) => {
		const blob = new Blob([text], { type: "text/plain" });
		formData.append("data", blob, `text_${index}.txt`);
	});

	if (args.datasetName) {
		formData.append("datasetName", args.datasetName);
	}
	if (args.datasetId) {
		formData.append("datasetId", args.datasetId);
	}
	if (args.nodeSet && args.nodeSet.length > 0) {
		args.nodeSet.forEach((node) => {
			formData.append("node_set", node);
		});
	}

	const response = await client.POST("/api/v1/add", {
		body: formData as any,
	});

	if (response.error) {
		logError("API error:", response.error);
		throw new Error(`Failed to add data: ${JSON.stringify(response.error)}`);
	}

	log("Data added successfully");
	return response.data;
};
