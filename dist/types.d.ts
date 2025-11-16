export type EmbeddingModelType = "openai" | "xenova" | "custom";
export interface OpenAIEmbedderConfig {
    type: "openai";
    apiKey?: string;
    model?: "text-embedding-ada-002" | "text-embedding-3-small" | "text-embedding-3-large";
}
export interface XenovaEmbedderConfig {
    type: "xenova";
    model?: "Xenova/all-MiniLM-L6-v2" | "Xenova/multi-qa-MiniLM-L6-cos-v1" | "Xenova/all-mpnet-base-v2";
}
export interface CustomEmbedderConfig {
    type: "custom";
    embedFn: (text: string) => Promise<number[]>;
    dimension: number;
}
export type EmbedderConfig = OpenAIEmbedderConfig | XenovaEmbedderConfig | CustomEmbedderConfig;
export interface IEmbedder {
    dimension: number;
    embed(text: string): Promise<number[]>;
}
export interface QueryResult {
    id: string;
    score: number;
    metadata: Record<string, any>;
    text: string;
}
export interface QueryOptions {
    query: string;
    topK?: number;
}
export interface UpsertOptions {
    metadata?: Record<string, any>;
}
export interface VectorDBOptions {
    dir?: string;
    storeName?: string;
    dimension?: number;
    embedderConfig: EmbedderConfig;
}
//# sourceMappingURL=types.d.ts.map