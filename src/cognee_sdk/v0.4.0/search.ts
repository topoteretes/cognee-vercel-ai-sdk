import type { LocalCogneeClient } from "./client.ts";
import type { SearchArgs } from "../types.ts";
import { logger } from "@/logger.ts";

const [log, logError] = [
	logger("local:v0.4.0:search"),
	logger("local:v0.4.0:search:error"),
];

/**
 * Search for nodes in the local Cognee knowledge graph (v0.4.0)
 * @param client - The local Cognee API client
 * @param args - Search operation arguments
 */
export const search = async (client: LocalCogneeClient, args: SearchArgs) => {
	log("Calling local Cognee search API (v0.4.0) with:", {
		query: args.query.substring(0, 50) + "...",
		searchType: args.searchType ?? "GRAPH_COMPLETION",
		datasets: args.datasets,
		topK: args.topK ?? 10,
	});

	const response = await client.POST("/api/v1/search", {
		body: {
			query: args.query,
			searchType: args.searchType ?? "GRAPH_COMPLETION",
			datasets: args.datasets ?? null,
			datasetIds: args.datasetIds ?? null,
			systemPrompt: args.systemPrompt ?? null,
			nodeName: args.nodeName ?? null,
			topK: args.topK ?? 10,
			onlyContext: args.onlyContext ?? false,
			useCombinedContext: false,
		},
	});

	if (response.error) {
		logError("API error:", response.error);
		throw new Error(`Failed to search: ${JSON.stringify(response.error)}`);
	}

	log("Search completed, results received");
	return response.data;
};
