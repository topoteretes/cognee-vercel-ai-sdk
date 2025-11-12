export interface CogneeWrapperOptions {
	apiKey: string;
	baseURL?: string;
	headers?: Record<string, string>;

	/* If specified, this will be used to store/search against */
	dataset_name?: string;

	/* Vercel Integration Options */
	storeInteractions?: boolean;
	retrieveMemory?: boolean;
}
