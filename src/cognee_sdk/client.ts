import type { CogneeSDK } from "./types";
import type { CogneeWrapperOptions } from "../types";
import { createCloudClient } from "./cloud/index";
import { createV040SDK } from "./v0.4.0/index";
import { logger } from "@/logger";

const log = logger("sdk-client");

export type CogneeClient =
	| { type: "cloud"; client: CogneeSDK }
	| { type: "local"; client: CogneeSDK; version: string };

interface HealthResponse {
	status: string;
	health: string;
	version: string;
}

/**
 * Fetches version from the /health endpoint
 * Returns version string like "0.4.0" or null if it's cloud/unreachable
 */
const getLocalVersion = async (baseUrl: string): Promise<string | null> => {
	try {
		const healthUrl = `${baseUrl}/health`;
		log("Checking version at:", healthUrl);

		const response = await fetch(healthUrl, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			log("Health check failed, assuming cloud endpoint");
			return null;
		}

		const data = (await response.json()) as HealthResponse;

		if (data?.version) {
			const versionMatch = data.version.match(/^(\d+\.\d+\.\d+)/);
			if (versionMatch && versionMatch[1]) {
				const version = versionMatch[1];
				log("Detected local Cognee version:", version);
				return version;
			}
		}

		log("No version found in health response, assuming cloud");
		return null;
	} catch (error) {
		log("Failed to fetch health endpoint:", error);
		return null;
	}
};

/**
 * Determines if a URL is a Cognee Cloud endpoint
 */
export const isCloudEndpoint = (url: string): boolean => {
	const cloudDomains = ["api.cognee.ai"];

	try {
		const urlObj = new URL(url);
		return cloudDomains.some((domain) => urlObj.hostname.includes(domain));
	} catch {
		return false;
	}
};

/**
 * Creates a local SDK based on detected version
 */
const createLocalSDKForVersion = (
	version: string,
	baseUrl: string,
	apiKey?: string,
): CogneeSDK => {
	log(`Creating local SDK for version ${version}`);

	if (version.startsWith("0.4.0")) {
		return createV040SDK(baseUrl, apiKey);
	}

	/**
	 * Placeholder for other versions
	 */

	// TODO: will remove fallback and probably prompt user if they're fine to use fallback
	log(`No specific implementation for version ${version}, using v0.4.0`);
	return createV040SDK(baseUrl, apiKey);
};

/**
 * Gets the appropriate SDK client based on the baseURL and version detection
 * - Checks /health endpoint to detect local version
 * - Falls back to cloud client if version detection fails or URL is cloud domain
 */
export const getSDKClient = async (
	options: CogneeWrapperOptions,
): Promise<CogneeClient> => {
	const baseUrl = options.baseURL ?? "https://api.cognee.ai";
	log("Creating client with baseURL:", baseUrl);

	if (options.apiKey) {
		log("Using API key:", options.apiKey.substring(0, 10) + "...");
	}

	if (isCloudEndpoint(baseUrl)) {
		log("Detected Cognee Cloud domain");
		if (!options.apiKey) {
			throw new Error("API key must be porivded for cloud");
		}
		return {
			type: "cloud",
			client: createCloudClient(baseUrl, options.apiKey, options.headers),
		};
	}

	const version = await getLocalVersion(baseUrl);

	if (version) {
		log(`Using local Cognee instance version ${version}`);
		return {
			type: "local",
			client: createLocalSDKForVersion(version, baseUrl, options.apiKey),
			version,
		};
	}

	throw new Error("No version could be matched");
};

/**
 * Creates a Cognee client for direct SDK usage (bypassing the AI wrapper)
 *
 * @example
 * ```typescript
 * import { createCogneeClient } from 'cognee-vercel-ai-sdk';
 *
 * const cognee = await createCogneeClient({
 *   apiKey: 'your-api-key',
 *   baseURL: 'http://localhost:8000', // optional, defaults to cloud
 * });
 *
 * // Add data
 * await cognee.add({
 *   payload: ['Some text to add'],
 *   datasetName: 'my_dataset',
 * });
 *
 * // Cognify (process data)
 * await cognee.cognify({
 *   datasets: ['my_dataset'],
 * });
 *
 * // Search
 * const results = await cognee.search({
 *   query: 'What is an agent?',
 *   datasets: ['my_dataset'],
 * });
 * ```
 */
export const createCogneeClient = async (
	options: CogneeWrapperOptions,
): Promise<CogneeSDK> => {
	const client = await getSDKClient(options);
	return client.client;
};
