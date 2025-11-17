import "dotenv/config";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { wrapWithCognee } from "../src/index";

const modelWithMemory = wrapWithCognee(anthropic("claude-3-haiku-20240307"), {
	apiKey: process.env.COGNEE_API_KEY!,
});

console.log("Sending prompt to model...");

const { text } = await generateText({
	model: modelWithMemory,
	prompt: "Write a vegetarian lasagna recipe for 4 people.",
});

console.log("Final Response:");
console.log(text);
