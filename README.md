# Cognee Vercel AI SDK

Add persistent memory and knowledge graph capabilities to any Vercel AI SDK language model. Works with OpenAI, Anthropic, and all other supported providers.

## Features

- **Automatic Memory Storage**: Every conversation is stored and processed into a knowledge graph
- **Context-Aware Responses**: Retrieve relevant context from past conversations automatically
- **Universal Compatibility**: Works with any Vercel AI SDK language model
- **Cloud & Self-Hosted**: Seamlessly supports both Cognee Cloud and local instances
- **Version Detection**: Automatically detects and adapts to your Cognee API version
- **Direct SDK Access**: Use Cognee's knowledge graph features independently from AI models
- **Type-Safe**: Full TypeScript support with OpenAPI-generated types

## Installation

```bash
npm install cognee-vercel-ai-sdk
# or
yarn add cognee-vercel-ai-sdk
```

## Quick Start

### 1. AI Model Wrapper (Automatic Memory)

Wrap any language model to automatically store conversations and enhance responses with memory:

```typescript
import { openai } from '@ai-sdk/openai';
import { wrapWithCognee } from 'cognee-vercel-ai-sdk';
import { generateText } from 'ai';

// Wrap your model
const model = wrapWithCognee(openai('gpt-4'), {
  apiKey: process.env.COGNEE_API_KEY,
  baseURL: 'http://localhost:8000', // optional, defaults to Cognee Cloud
  storeInteractions: true,           // store conversations
  retrieveMemory: true,              // enhance prompts with past context
  dataset_name: 'my_conversations',  // organize by dataset
});

// Use normally with Vercel AI SDK
const { text } = await generateText({
  model,
  prompt: 'What is machine learning?',
});

// Later conversations automatically have context
const { text: followUp } = await generateText({
  model,
  prompt: 'Can you give me an example?', // References previous conversation
});
```

### 2. Direct SDK Usage

Use Cognee's knowledge graph features independently:

```typescript
import { createCogneeClient } from 'cognee-vercel-ai-sdk';

// Create client (auto-detects cloud vs local)
const cognee = await createCogneeClient({
  apiKey: process.env.COGNEE_API_KEY,
  baseURL: 'http://localhost:8000', // optional
});

// Add data
await cognee.add({
  payload: [
    'Machine learning is a subset of AI.',
    'Neural networks are inspired by the human brain.',
  ],
  datasetName: 'ai_knowledge',
});

// Process into knowledge graph
await cognee.cognify({
  datasets: ['ai_knowledge'],
});

// Search the knowledge graph
const results = await cognee.search({
  query: 'How does machine learning relate to neural networks?',
  datasets: ['ai_knowledge'],
  searchType: 'GRAPH_COMPLETION',
});
```

## Configuration

### Environment Variables

```bash
# For Cognee Cloud
COGNEE_API_KEY=your-cloud-api-key

# For local Cognee instance
COGNEE_API_KEY=optional-local-key
COGNEE_BASE_URL=http://localhost:8000
```

### Wrapper Options

```typescript
interface CogneeWrapperOptions {
  apiKey: string;                    // Cognee API key
  baseURL?: string;                  // API endpoint (default: Cognee Cloud)
  storeInteractions?: boolean;       // Store conversations (default: true)
  retrieveMemory?: boolean;          // Enhance with memory (default: false)
  dataset_name?: string;             // Dataset name (default: 'vercel_conversations')
  headers?: Record<string, string>;  // Custom headers
}
```

## Architecture

The SDK automatically detects your Cognee environment:

- **Cloud**: Connects to `api.cognee.ai` using cloud-specific APIs
- **Local**: Detects version from `/health` endpoint and uses appropriate local APIs
- **Versioned**: Each Cognee version (v0.4.0, v0.5.0, etc.) has dedicated implementations

Both environments share the same unified interface for seamless compatibility.

## API Reference

### CogneeSDK Interface

All implementations (cloud and local) share this common interface:

```typescript
interface CogneeSDK {
  // Add data to a dataset
  add(args: {
    payload: string[];
    datasetName?: string;
    datasetId?: string;
    nodeSet?: string[];
  }): Promise<any>;

  // Process datasets into knowledge graph
  cognify(args: {
    datasets?: string[];
    datasetIds?: string[];
    runInBackground?: boolean;
    customPrompt?: string;
    temporalCognify?: boolean;
  }): Promise<any>;

  // Search the knowledge graph
  search(args: {
    query: string;
    searchType?: 'GRAPH_COMPLETION' | 'CHUNKS' | 'SUMMARIES' | /* ... */;
    datasets?: string[];
    datasetIds?: string[];
    topK?: number;
    systemPrompt?: string;
    onlyContext?: boolean;
  }): Promise<any>;
}
```

## Examples

See the `examples/` directory for complete working examples:

- `openai_example.ts` - Basic OpenAI integration with memory
- `anthropic_example.ts` - Claude integration
- `memory_retrieval_example.ts` - Store and retrieve from knowledge graph
- `local_cognee_example.ts` - Using local Cognee instance

## Requirements

- Node.js 18+
- Vercel AI SDK 3.0+
- Cognee Cloud account or local Cognee instance

## How It Works

1. **Storage**: Conversations are stored as text in Cognee datasets
2. **Processing**: `cognify()` transforms text into a knowledge graph with entities and relationships
3. **Retrieval**: When `retrieveMemory` is enabled, relevant context is automatically retrieved
4. **Enhancement**: Retrieved context is injected into prompts as system messages
5. **Response**: The LLM generates responses informed by your knowledge graph

## Local Development

Running against a local Cognee instance:

```typescript
const model = wrapWithCognee(openai('gpt-4'), {
  apiKey: '', // Optional for local
  baseURL: 'http://localhost:8000',
});
```

The SDK automatically detects the version and uses the appropriate API format.

## Contributing

Contributions are welcome! This SDK is designed to be extensible:

- Add new Cognee versions by creating folders like `src/cognee_sdk/v0.5.0/`
- Each version implements the common `CogneeSDK` interface
- Version detection happens automatically via `/health` endpoint

## License

MIT

## Links

- [Cognee Documentation](https://docs.cognee.ai)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [GitHub Repository](https://github.com/your-repo/cognee-vercel-ai-sdk)

