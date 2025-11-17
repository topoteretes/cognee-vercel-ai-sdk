import type { CloudCogneeClient } from "./client";
import type { SearchArgs } from "../types";
import { logger } from "@/logger";

const [log, logError] = [logger("cloud:search"), logger("cloud:search:error")];

/**
 * Search for nodes in the Cognee Cloud knowledge graph
 * @param client - The cloud client
 * @param args - Search operation arguments
 */
export const search = async (client: CloudCogneeClient, args: SearchArgs) => {
	log("Calling Cognee Cloud search API with:", {
		query: args.query.substring(0, 50) + "...",
		searchType: args.searchType ?? "GRAPH_COMPLETION",
		datasets: args.datasets,
		topK: args.topK ?? 10,
	});

	const response = await client.POST("/api/search", {
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
