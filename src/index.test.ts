import "dotenv/config";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { wrapWithCognee } from "./index.ts";

const modelWithMemory = wrapWithCognee(openai("gpt-4"), {
	apiKey: process.env.COGNEE_API_KEY!,
});

console.log("Sending prompt to model...");

const { text } = await generateText({
	model: modelWithMemory,
	prompt: "What is an agent?",
});

console.log("Final Response:");
console.log(text);
