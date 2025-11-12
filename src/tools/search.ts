import type { CogneeClient } from "../cognee_sdk/client.ts";
import { logger } from "@/logger.ts";

const [log, logError] = [logger("search-tool"), logger("search-tool:error")];

type SearchType =
	| "SUMMARIES"
	| "INSIGHTS"
	| "CHUNKS"
	| "RAG_COMPLETION"
	| "GRAPH_COMPLETION"
	| "GRAPH_SUMMARY_COMPLETION"
	| "CODE"
	| "CYPHER"
	| "NATURAL_LANGUAGE"
	| "GRAPH_COMPLETION_COT"
	| "GRAPH_COMPLETION_CONTEXT_EXTENSION"
	| "FEELING_LUCKY"
	| "FEEDBACK"
	| "TEMPORAL"
	| "CODING_RULES"
	| "CHUNKS_LEXICAL";

interface SearchOptions {
	query: string;
	searchType?: SearchType;
	datasets?: string[] | null;
	datasetIds?: string[] | null;
	systemPrompt?: string | null;
	nodeName?: string[] | null;
	topK?: number | null;
	onlyContext?: boolean;
}

/**
 * Search for nodes in the Cognee knowledge graph
 * @param client - The Cognee API client
 * @param options - Search query and configuration options
 */
export const search = async (client: CogneeClient, options: SearchOptions) => {
	log("Calling Cognee search API with:", {
		query: options.query.substring(0, 50) + "...",
		searchType: options.searchType ?? "GRAPH_COMPLETION",
		datasets: options.datasets,
		topK: options.topK ?? 10,
	});

	const response = await client.POST("/api/search", {
		body: {
			query: options.query,
			searchType: options.searchType ?? "GRAPH_COMPLETION",
			datasets: options.datasets ?? null,
			datasetIds: options.datasetIds ?? null,
			systemPrompt: options.systemPrompt ?? null,
			nodeName: options.nodeName ?? null,
			topK: options.topK ?? 10,
			onlyContext: options.onlyContext ?? false,
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
