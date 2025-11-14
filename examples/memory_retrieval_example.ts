import "dotenv/config";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { wrapWithCognee, createCogneeClient } from "@/index.ts";

const cogneeOptions = {
	baseURL: "http://localhost:8000",
	dataset_name: "vercel_contracts_example",
	storeInteractions: true,
	retrieveMemory: true,
};

const modelWithMemory = wrapWithCognee(openai("gpt-4"), cogneeOptions);

const cogneeClient = await createCogneeClient(cogneeOptions);

console.log("Step 1: Storing contract information");

const contracts = [
	`We have signed a contract with the following company: "Meditech Solutions". Company is in the healthcare industry. Start date is Jan 2023 and end date is Dec 2025. Contract value is £1.2M.`,
	`We have signed a contract with the following company: "QuantumSoft". Company is in the technology industry. Start date is Aug 2024 and end date is Aug 2028. Contract value is £5.5M.`,
	`We have signed a contract with the following company: "Orion Retail Group". Company is in the retail industry. Start date is Mar 2024 and end date is Mar 2026. Contract value is £850K.`,
];

for (const [index, contract] of contracts.entries()) {
	console.log(`Storing contract ${index + 1}/${contracts.length}`);
	await cogneeClient.add({
		payload: [contract],
		datasetName: cogneeOptions.dataset_name,
	});
}

await cogneeClient.cognify({
	datasets: [cogneeOptions.dataset_name],
});

console.log("Step 2: Querying about healthcare contracts");

const { text: searchResponse } = await generateText({
	model: modelWithMemory,
	prompt: `I need to research our contract portfolio. Can you search for any contracts we have with companies in the healthcare industry? Please provide details about the contract(s) you find.`,
});

console.log(searchResponse);
