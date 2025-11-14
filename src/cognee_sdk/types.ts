// Common interface for ALL Cognee SDK implementations (both cloud and local)
// Each implementation (cloud, v0.4.0, v0.5.0, etc.) must implement this interface

export type AddArgs = {
	payload: string[];
	datasetName?: string | null;
	datasetId?: string | null;
	nodeSet?: string[] | null;
};

export type CognifyArgs = {
	datasets?: string[] | null;
	datasetIds?: string[] | null;
	runInBackground?: boolean | null;
	customPrompt?: string | null;
	temporalCognify?: boolean | null;
};

export type SearchType =
	| "SUMMARIES"
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

export type SearchArgs = {
	query: string;
	searchType?: SearchType;
	datasets?: string[] | null;
	datasetIds?: string[] | null;
	systemPrompt?: string | null;
	nodeName?: string[] | null;
	topK?: number | null;
	onlyContext?: boolean;
};

export interface CogneeSDK {
	add: (args: AddArgs) => Promise<any>;
	cognify: (args: CognifyArgs) => Promise<any>;
	search: (args: SearchArgs) => Promise<any>;
}
