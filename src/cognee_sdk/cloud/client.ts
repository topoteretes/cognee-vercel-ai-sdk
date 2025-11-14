import createClient from "openapi-fetch";
import type { paths as CloudPaths } from "./cognee_cloud.d.ts";

export type CloudCogneeClient = ReturnType<typeof createClient<CloudPaths>>;

export const createCloudRawClient = (
	baseUrl: string,
	apiKey: string,
	headers?: Record<string, string>,
): CloudCogneeClient => {
	return createClient<CloudPaths>({
		baseUrl,
		headers: {
			"X-Api-Key": apiKey,
			...headers,
		},
	});
};
