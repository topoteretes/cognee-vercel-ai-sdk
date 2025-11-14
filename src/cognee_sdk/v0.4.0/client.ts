import createClient from "openapi-fetch";
import type { paths } from "./cognee.v0.4.0.d.ts";

export type LocalCogneeClient = ReturnType<typeof createClient<paths>>;

export const createLocalClient = (
	baseUrl: string,
	apiKey?: string,
): LocalCogneeClient => {
	const headers: Record<string, string> = {};

	if (apiKey) {
		headers["X-Api-Key"] = apiKey;
	}

	return createClient<paths>({
		baseUrl,
		headers,
	});
};
