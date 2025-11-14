import createClient from "openapi-fetch";
import type { paths } from "./cognee.v0.4.0.d.ts";

export type LocalCogneeClient = ReturnType<typeof createClient<paths>>;

export const createLocalClient = (
	baseUrl: string,
	apiKey?: string,
): LocalCogneeClient => {
	const headers: Record<string, string> = {};

	return createClient<paths>({
		baseUrl,
		headers,
	});
};
