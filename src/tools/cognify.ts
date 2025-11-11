import type { CogneeClient } from "../cognee_sdk/client.ts";

interface CognifyOptions {
	datasets?: string[] | null;
	datasetIds?: string[] | null;
	runInBackground?: false | null;
	customPrompt?: string | null;
	temporalCognify?: boolean | null;
}

/**
 * Process datasets into knowledge graphs
 * @param client - The Cognee API client
 * @param options - Processing options
 */
export const cognify = async (
	client: CogneeClient,
	options: CognifyOptions = {},
) => {
	const response = await client.POST("/api/cognify", {
		body: {
			datasets: options.datasets ?? null,
			datasetIds: options.datasetIds ?? null,
			runInBackground: options.runInBackground ?? false,
			customPrompt: options.customPrompt ?? null,
			temporalCognify: options.temporalCognify ?? null,
		},
	});

	if (response.error) {
		throw new Error(`Failed to cognify: ${JSON.stringify(response.error)}`);
	}

	return response.data;
};
