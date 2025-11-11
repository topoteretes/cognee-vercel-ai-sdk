export interface CogneeWrapperOptions {
	apiKey: string;
	baseURL?: string;
	headers?: Record<string, string>;

	/* Vercel Integration Options */
	storeInteractions?: boolean;
	retrieveMemory?: boolean;
}
