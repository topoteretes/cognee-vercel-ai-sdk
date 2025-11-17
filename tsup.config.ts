import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	splitting: false,
	treeshake: true,
	outDir: "dist",
	external: [
		"@ai-sdk/provider",
		"@ai-sdk/anthropic",
		"@ai-sdk/openai",
		"ai",
		"debug",
		"dotenv",
		"openapi-fetch",
		"zod",
	],
});
