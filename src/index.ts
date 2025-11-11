import {
	type LanguageModelV2,
	type LanguageModelV2CallOptions,
	type LanguageModelV2FinishReason,
	type LanguageModelV2Content,
	type LanguageModelV2Usage,
	type SharedV2ProviderMetadata,
	type LanguageModelV2ResponseMetadata,
	type SharedV2Headers,
	type LanguageModelV2CallWarning,
	type LanguageModelV2StreamPart,
} from "@ai-sdk/provider";
import type { CogneeWrapperOptions } from "@/types.ts";
import { getSDKClient, type CogneeClient } from "@/cognee_sdk/client.ts";
import { add, cognify } from "@/tools";

import { logger } from "@/logger.ts";

const [log, logError] = [logger("entrypoint"), logger("entrypoint:error")];

export class CogneeLanguageModelWrapper implements LanguageModelV2 {
	readonly specificationVersion = "v2" as const;
	readonly provider: string;
	readonly modelId: string;
	readonly supportedUrls:
		| Record<string, RegExp[]>
		| PromiseLike<Record<string, RegExp[]>>;

	private baseModel: LanguageModelV2;
	private cogneeClient: CogneeClient;
	private cogneeOptions: CogneeWrapperOptions;

	constructor(baseModel: LanguageModelV2, cogneeOptions: CogneeWrapperOptions) {
		log("Initializing wrapper for model:", baseModel.modelId);
		this.baseModel = baseModel;

		this.cogneeOptions = {
			/* defaults */
			storeInteractions: true,
			retrieveMemory: false,
			/* defaults */
			...cogneeOptions,
		};

		this.cogneeClient = getSDKClient(this.cogneeOptions);

		this.provider = baseModel.provider;
		this.modelId = baseModel.modelId;
		this.supportedUrls = baseModel.supportedUrls;
		log("Wrapper initialized successfully");
	}

	private extractTextFromPrompt(
		prompt: LanguageModelV2CallOptions["prompt"],
	): string {
		if (Array.isArray(prompt)) {
			return prompt
				.map((msg) => {
					if (msg.role === "user" || msg.role === "assistant") {
						return msg.content
							.map((part) => {
								if (part.type === "text") {
									return part.text;
								}
								return "";
							})
							.join(" ");
					}
					return "";
				})
				.join("\n");
		}
		return "";
	}

	private extractTextFromContent(
		content: Array<LanguageModelV2Content>,
	): string {
		return content
			.map((part) => {
				if (part.type === "text") {
					return part.text;
				}
				return "";
			})
			.join(" ");
	}

	private async storeConversationInCognee(textData: string[]) {
		try {
			log("Storing interaction in Cognee...");
			const addResult = await add(this.cogneeClient, {
				textData,
				datasetName: "vercel_conversations",
			});
			log("Successfully stored interaction:", addResult);

			await cognify(this.cogneeClient, {
				datasets: ["vercel_conversations"],
				runInBackground: false,
			});
		} catch (error) {
			logError("Failed to store interaction:", error);
		}
	}

	async doGenerate(options: LanguageModelV2CallOptions): Promise<{
		content: Array<LanguageModelV2Content>;
		finishReason: LanguageModelV2FinishReason;
		usage: LanguageModelV2Usage;
		providerMetadata?: SharedV2ProviderMetadata;
		request?: { body?: unknown };
		response?: LanguageModelV2ResponseMetadata & {
			headers?: SharedV2Headers;
			body?: unknown;
		};
		warnings: Array<LanguageModelV2CallWarning>;
	}> {
		log("Starting generation...");

		// TODO: enrich baseModel generation with Cognee memory

		log("Calling base model...");
		const result = await this.baseModel.doGenerate(options);
		log("Received response from base model");

		const promptText = this.extractTextFromPrompt(options.prompt);
		const responseText = this.extractTextFromContent(result.content);

		log("Extracted prompt:", promptText.substring(0, 100) + "...");
		log("Extracted response:", responseText.substring(0, 100) + "...");

		if (this.cogneeOptions.storeInteractions) {
			const textData = [`User: ${promptText}`, `Assistant: ${responseText}`];
			await this.storeConversationInCognee(textData);
		}

		log("Generation complete\n");
		return result;
	}

	async doStream(options: LanguageModelV2CallOptions): Promise<{
		stream: ReadableStream<LanguageModelV2StreamPart>;
		request?: { body?: unknown };
		response?: { headers?: SharedV2Headers };
	}> {
		// TODO: plug into streaming

		const result = await this.baseModel.doStream(options);

		return result;
	}
}

/**
 * Wrap any language model with Cognee memory and context enhancement
 *
 * @example
 * ```typescript
 * import { openai } from '@ai-sdk/openai';
 * import { wrapWithCognee } from './cognee-sdk';
 *
 * const model = wrapWithCognee(openai('gpt-4'), {
 *   apiKey: 'your-cognee-api-key',
 *   userId: 'user123',
 * });
 *
 * const { text } = await generateText({
 *   model,
 *   prompt: 'What is an agent?',
 * });
 * ```
 */
export function wrapWithCognee(
	model: LanguageModelV2,
	options: CogneeWrapperOptions,
): LanguageModelV2 {
	return new CogneeLanguageModelWrapper(model, options);
}

export { getSDKClient, type CogneeClient } from "./cognee_sdk/client.ts";
export { add, cognify } from "./tools/index.ts";
export type { CogneeWrapperOptions } from "./types.ts";
