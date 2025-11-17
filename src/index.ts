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
import type { CogneeWrapperOptions } from "@/types";
import { getSDKClient, type CogneeClient } from "@/cognee_sdk/client";

import { logger } from "@/logger";

const [log, logError] = [logger("entrypoint"), logger("entrypoint:error")];

export class CogneeLanguageModelWrapper implements LanguageModelV2 {
	readonly specificationVersion = "v2" as const;
	readonly provider: string;
	readonly modelId: string;
	readonly supportedUrls:
		| Record<string, RegExp[]>
		| PromiseLike<Record<string, RegExp[]>>;

	private baseModel: LanguageModelV2;
	private cogneeClient: CogneeClient | null = null;
	private cogneeClientPromise: Promise<CogneeClient>;
	private cogneeOptions: CogneeWrapperOptions;

	constructor(baseModel: LanguageModelV2, cogneeOptions: CogneeWrapperOptions) {
		log("Initializing wrapper for model:", baseModel.modelId);
		this.baseModel = baseModel;

		this.cogneeOptions = {
			/* defaults */
			storeInteractions: true,
			retrieveMemory: false,
			dataset_name: "vercel_conversations",
			/* defaults */
			...cogneeOptions,
		};

		// Initialize client asynchronously
		this.cogneeClientPromise = getSDKClient(this.cogneeOptions).then(
			(client) => {
				this.cogneeClient = client;
				log("Cognee client initialized:", client.type);
				return client;
			},
		);

		this.provider = baseModel.provider;
		this.modelId = baseModel.modelId;
		this.supportedUrls = baseModel.supportedUrls;
		log("Wrapper initialized successfully");
	}

	private async ensureClient(): Promise<CogneeClient> {
		if (this.cogneeClient) {
			return this.cogneeClient;
		}
		return await this.cogneeClientPromise;
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

	private async storeConversationInCognee(textData: string[]): Promise<void> {
		try {
			log("Storing interaction in Cognee...");
			const cogneeClient = await this.ensureClient();

			const addResult = await cogneeClient.client.add({
				payload: textData,
				datasetName: this.cogneeOptions.dataset_name!,
			});
			log("Successfully stored interaction:", addResult);

			await cogneeClient.client.cognify({
				datasets: [this.cogneeOptions.dataset_name!],
				runInBackground: false,
			});
		} catch (error) {
			logError("Failed to store interaction:", error);
		}
	}

	private async retrieveFromMemoryInCognee(query: string): Promise<string> {
		try {
			log(
				"Retrieving memories from Cognee for query:",
				query.substring(0, 100) + "...",
			);

			const cogneeClient = await this.ensureClient();

			const result = await cogneeClient.client.search({
				query,
				datasets: [this.cogneeOptions.dataset_name!],
				searchType: "GRAPH_COMPLETION",
				topK: 5,
			});

			let context = "";
			if (Array.isArray(result)) {
				context = result
					.map((item: any) => {
						if (typeof item === "string") return item;
						if (item.text) return item.text;
						if (item.content) return item.content;
						if (item.answer) return item.answer;
						return JSON.stringify(item);
					})
					.join("\n\n");
			} else if (typeof result === "object" && result !== null) {
				if ((result as any).answer) {
					context = (result as any).answer;
				} else if ((result as any).context) {
					context = (result as any).context;
				} else {
					context = JSON.stringify(result);
				}
			}

			if (context) {
				log(
					"Retrieved context from Cognee:",
					context.substring(0, 100) + "...",
				);
			} else {
				log("No relevant context found in Cognee");
			}

			return context;
		} catch (error) {
			logError("Failed to retrieve from Cognee:", error);
			return "";
		}
	}

	private augmentPromptWithContext(
		prompt: LanguageModelV2CallOptions["prompt"],
		context: string,
	): LanguageModelV2CallOptions["prompt"] {
		if (!context || !Array.isArray(prompt)) {
			return prompt;
		}

		const contextMessage = {
			role: "system" as const,
			content: `Relevant context from previous conversations:\n\n${context}\n\nUse this context to inform your response when relevant.`,
		};

		return [contextMessage, ...prompt];
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

		let enhancedOptions = options;

		if (this.cogneeOptions.retrieveMemory) {
			const promptText = this.extractTextFromPrompt(options.prompt);
			const context = await this.retrieveFromMemoryInCognee(promptText);

			if (context) {
				log("Augmenting prompt with Cognee context");
				enhancedOptions = {
					...options,
					prompt: this.augmentPromptWithContext(options.prompt, context),
				};
			}
		}

		log("Calling base model...");
		const result = await this.baseModel.doGenerate(enhancedOptions);
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
		log("Starting streaming generation...");

		let enhancedOptions = options;

		if (this.cogneeOptions.retrieveMemory) {
			const promptText = this.extractTextFromPrompt(options.prompt);
			const context = await this.retrieveFromMemoryInCognee(promptText);

			if (context) {
				log("Augmenting prompt with Cognee context");
				enhancedOptions = {
					...options,
					prompt: this.augmentPromptWithContext(options.prompt, context),
				};
			}
		}

		log("Calling base model stream...");
		const result = await this.baseModel.doStream(enhancedOptions);

		const promptText = this.extractTextFromPrompt(options.prompt);
		let accumulatedText = "";

		const transformedStream = result.stream.pipeThrough(
			new TransformStream<LanguageModelV2StreamPart, LanguageModelV2StreamPart>(
				{
					transform: (chunk, controller) => {
						if (chunk.type === "text-delta") {
							accumulatedText += chunk.delta;
						}

						controller.enqueue(chunk);
					},
					flush: async (controller) => {
						if (this.cogneeOptions.storeInteractions && accumulatedText) {
							log("Stream complete, storing interaction...");
							log("Extracted prompt:", promptText.substring(0, 100) + "...");
							log(
								"Extracted response:",
								accumulatedText.substring(0, 100) + "...",
							);

							const textData = [
								`User: ${promptText}`,
								`Assistant: ${accumulatedText}`,
							];

							this.storeConversationInCognee(textData).catch((error) => {
								logError("Failed to store streaming conversation:", error);
							});
						}
						log("Streaming generation complete\n");
					},
				},
			),
		);

		return {
			stream: transformedStream,
			...(result.request && { request: result.request }),
			...(result.response && { response: result.response }),
		};
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

export {
	getSDKClient,
	createCogneeClient,
	type CogneeClient,
} from "./cognee_sdk/client";
export type {
	CogneeSDK,
	AddArgs,
	CognifyArgs,
	SearchArgs,
} from "./cognee_sdk/types";
export type { CogneeWrapperOptions } from "./types";
