import createClient from "openapi-fetch";
import type { paths } from "./cognee_cloud";
import type { CogneeWrapperOptions } from "../types.ts";

import { logger } from "@/logger.ts";

const log = logger("sdk-client");

export type CogneeClient = ReturnType<typeof createClient<paths>>;

export const getSDKClient = (options: CogneeWrapperOptions): CogneeClient => {
	const baseUrl = options.baseURL ?? "https://api.cognee.ai";
	log("Creating client with baseURL:", baseUrl);
	log("Using API key:", options.apiKey.substring(0, 10) + "...");

	const client = createClient<paths>({
		baseUrl,
		headers: {
			"X-Api-Key": options.apiKey,
			...options.headers,
		},
	});

	return client;
};
