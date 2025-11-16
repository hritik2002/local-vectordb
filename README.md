# @hritik2002/local-vectordb

A **simple, local vector database** for quick hack projects and MVPs. No cloud services, no API keys required (unless you want to use OpenAI), everything runs locally.

Perfect for prototyping semantic search, RAG applications, or any project that needs vector similarity search without the complexity of setting up Pinecone or other paid services.

## Why This?

- 🚀 **Zero Configuration** - Works out of the box, no cloud setup needed
- 💰 **Free & Local** - No paid services, runs entirely on your machine
- ⚡ **Fast** - HNSW algorithm for sub-millisecond searches even with 100K+ vectors
- 📦 **Simple API** - Just 2 methods: `upsert()`, `query()`, and you're done
- 🔒 **Private** - All data stays on your machine, perfect for sensitive projects
- 🎯 **MVP Ready** - Get semantic search working in minutes, not hours

## Quick Start

```bash
npm install @hritik2002/local-vectordb
```

```typescript
import { VectorDB } from "@hritik2002/local-vectordb";
import type { EmbedderConfig } from "@hritik2002/local-vectordb";

// Option 1: Use local embeddings (100% free, no API keys)
const localConfig: EmbedderConfig = {
  type: "xenova",
  model: "Xenova/multi-qa-MiniLM-L6-cos-v1", // Downloads automatically
};

const db = new VectorDB({
  embedderConfig: localConfig,
});

// Add documents
await db.upsert("Hritik works at Dream11 as a software engineer");
await db.upsert("The weather is sunny today");
await db.upsert("Python is a programming language");

// Search
const results = await db.query({
  query: "Where does Hritik work?",
  topK: 3,
});

console.log(results);
// [
//   {
//     id: "...",
//     score: 0.89,
//     text: "Hritik works at Dream11 as a software engineer",
//     metadata: {}
//   },
//   ...
// ]
```

## Embedding Options

### 1. Local Embeddings (Recommended for MVPs)

**100% free, no API keys, works offline:**

```typescript
import { VectorDB } from "@hritik2002/local-vectordb";

const db = new VectorDB({
  embedderConfig: {
    type: "xenova",
    model: "Xenova/multi-qa-MiniLM-L6-cos-v1", // Best for Q&A
    // or: "Xenova/all-MiniLM-L6-v2" // Faster, general purpose
    // or: "Xenova/all-mpnet-base-v2" // Higher quality
  },
});
```

Models download automatically on first use (~50-200MB).

### 2. OpenAI Embeddings (Optional)

Only if you want higher quality embeddings (requires API key):

```typescript
const db = new VectorDB({
  embedderConfig: {
    type: "openai",
    apiKey: process.env.OPENAI_API_KEY, // or pass directly
    model: "text-embedding-ada-002",
  },
});
```

### 3. Custom Embeddings

Bring your own embedding function:

```typescript
const db = new VectorDB({
  embedderConfig: {
    type: "custom",
    embedFn: async (text: string) => {
      // Your embedding logic
      return yourEmbeddingFunction(text);
    },
    dimension: 384, // Your embedding dimension
  },
});
```

## API

### `new VectorDB(options)`

```typescript
interface VectorDBOptions {
  dir?: string;              // Storage directory (default: "./vdb")
  storeName?: string;         // Store name (default: "default")
  embedderConfig: EmbedderConfig; // Embedding configuration
}
```

### `db.upsert(text, options?)`

Add or update a document:

```typescript
const id = await db.upsert("Your text here", {
  metadata: { source: "document.pdf", page: 1 }
});
```

### `db.query(options)`

Search for similar documents:

```typescript
const results = await db.query({
  query: "What is this about?",
  topK: 5, // Number of results (default: 5)
});

// Returns:
// Array<{
//   id: string;
//   score: number;        // Similarity score (0-1)
//   text: string;         // Original text
//   metadata: Record<string, any>;
// }>
```

## Performance

Uses **HNSW (Hierarchical Navigable Small World)** for fast approximate nearest neighbor search:

- **1K vectors**: ~1ms
- **10K vectors**: ~10ms  
- **100K vectors**: ~20ms
- **1M vectors**: ~30ms

Data is persisted to JSON files and automatically loaded on startup.

## Use Cases

- 🧪 **Prototyping** - Quick semantic search for hackathons
- 📚 **RAG Applications** - Local document search without cloud dependencies
- 🔍 **Content Discovery** - Find similar content in your app
- 💡 **MVPs** - Get to market faster without infrastructure setup
- 🔒 **Private Projects** - Keep sensitive data on your machine

## Comparison

| Feature | This Package | Pinecone | Weaviate |
|---------|-------------|----------|----------|
| Setup Time | 0 minutes | 10+ minutes | 30+ minutes |
| Cost | Free | Paid | Self-hosted |
| Local | ✅ Yes | ❌ No | ⚠️ Optional |
| API Complexity | Simple | Complex | Complex |
| Best For | MVPs, Hacks | Production | Enterprise |

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  VectorDB,
  EmbedderConfig,
  QueryOptions,
  QueryResult,
  UpsertOptions,
} from "@hritik2002/local-vectordb";
```

## Future Scope

This package is focused on simplicity for MVPs and quick projects. Here are some features we're considering for future versions:

### Performance & Optimization
- **Embedding Caching** - Cache computed embeddings to avoid recomputing for repeated upserts of the same text (will learn & implement - Medium)
- **Batch Operations** - `upsertMany()` and `deleteMany()` for bulk operations (Easy | Medium)

### Query Enhancements
- **Metadata Filtering** - Filter results by metadata before/after vector searchript
  await db.query({
    query: "search text",
    topK: 10,
    filter: { source: "bio", category: "tech" } // Only search in matching docs
  }); (Medium)
- **Query Expansion** - Automatically expand queries with synonyms or related terms (Medium) (Will research more)

### Data Management
- **Update/Delete Operations** - Proper update and delete methods (currently updates create new entries) (need to read more about this, Medium)
- **Multi-Store Queries** - Search across multiple stores simultaneously (Will read more & implement)

### Embedding Providers
- **More Providers** - Support for Cohere, HuggingFace Inference API, Ollama, etc. (Easy | Medium)
- **Embedding Ensembles** - Combine multiple embedding models for better results (Easy | Medium)

### Storage Improvements
- **Compression** - Compress stored vectors to reduce disk usage (Medium | Hard)
- **Incremental Indexing** - Update HNSW index incrementally instead of full rebuild  (Medium | Hard)

### Developer Experience
- **Observability** - Query metrics, performance monitoring, debug mode
- **Better Error Messages** - More helpful error messages and validation
- **Migration Tools** - Help migrate from other vector databases or a script to migrate the json into pinecone or any other service (for prod)

### Advanced Features
- **Versioning** - Track changes to documents over time
- **Deduplication** - Automatically detect and handle duplicate documents (Hard)

**Note:** These are ideas for future development. The current focus remains on simplicity and ease of use for MVPs and quick projects.

## License

MIT

## Contributing

PRs welcome! This is built for the community of developers who want to move fast without infrastructure headaches.
