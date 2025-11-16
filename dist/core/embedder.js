import OpenAI from "openai";
import { AutoTokenizer, AutoModel } from "@xenova/transformers";
import mean from "ml-array-mean";
export class Embedder {
    dimension = 0;
    config;
    openaiClient;
    xenovaTokenizer;
    xenovaModel;
    customEmbedFn;
    constructor(config) {
        this.config = config;
        switch (config.type) {
            case "openai":
                this._initOpenAI(config);
                break;
            case "xenova":
                this._initXenova(config);
                break;
            case "custom":
                this._initCustom(config);
                break;
            default:
                throw new Error(`Unknown embedder type: ${config.type}`);
        }
    }
    _initOpenAI(config) {
        const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OpenAI API key is required. " +
                "Please set OPENAI_API_KEY environment variable or pass apiKey in config. " +
                "Example: { type: 'openai', apiKey: 'your-key' }");
        }
        this.openaiClient = new OpenAI({ apiKey });
        const model = config.model || "text-embedding-ada-002";
        const dimensions = {
            "text-embedding-ada-002": 1536,
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
        };
        this.dimension = dimensions[model] || 1536;
    }
    async _initXenova(config) {
        const modelName = config.model || "Xenova/all-MiniLM-L6-v2";
        try {
            this.xenovaTokenizer = await AutoTokenizer.from_pretrained(modelName);
            this.xenovaModel = await AutoModel.from_pretrained(modelName);
            const dimensions = {
                "Xenova/all-MiniLM-L6-v2": 384,
                "Xenova/multi-qa-MiniLM-L6-cos-v1": 384,
                "Xenova/all-mpnet-base-v2": 768,
            };
            this.dimension = dimensions[modelName] || 384;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to load Xenova model ${modelName}: ${errorMessage}`);
        }
    }
    _initCustom(config) {
        if (!config.embedFn || typeof config.embedFn !== "function") {
            throw new Error("Custom embedder requires embedFn function");
        }
        if (!config.dimension || config.dimension <= 0) {
            throw new Error("Custom embedder requires valid dimension > 0");
        }
        this.customEmbedFn = config.embedFn;
        this.dimension = config.dimension;
    }
    async embed(text) {
        if (!text || typeof text !== "string") {
            throw new Error("Text must be a non-empty string");
        }
        switch (this.config.type) {
            case "openai":
                return this._embedOpenAI(text);
            case "xenova":
                return this._embedXenova(text);
            case "custom":
                return this._embedCustom(text);
            default:
                throw new Error(`Unknown embedder type: ${this.config.type}`);
        }
    }
    async _embedOpenAI(text) {
        if (!this.openaiClient) {
            throw new Error("OpenAI client not initialized");
        }
        const model = this.config.model || "text-embedding-ada-002";
        try {
            const response = await this.openaiClient.embeddings.create({
                model,
                input: text,
            });
            return response.data[0].embedding;
        }
        catch (error) {
            if (error.message?.includes("API key")) {
                throw new Error("OpenAI API key not found. Please set OPENAI_API_KEY environment variable or pass apiKey in config.");
            }
            throw error;
        }
    }
    async _embedXenova(text) {
        if (!this.xenovaTokenizer || !this.xenovaModel) {
            throw new Error("Xenova model not initialized");
        }
        const tokens = await this.xenovaTokenizer(text, {
            padding: false,
            truncation: true,
        });
        const output = await this.xenovaModel(tokens);
        const hiddenState = output.last_hidden_state;
        const data = Array.from(hiddenState.data);
        const dims = hiddenState.dims;
        const batchSize = dims[0];
        const seqLength = dims[1];
        const hiddenSize = dims[2];
        const attentionMask = tokens.attention_mask
            ? Array.from(tokens.attention_mask.data)
            : null;
        const embeddings = new Float32Array(hiddenSize);
        const batchIdx = 0;
        for (let i = 0; i < hiddenSize; i++) {
            const values = [];
            for (let s = 0; s < seqLength; s++) {
                if (attentionMask && attentionMask[batchIdx * seqLength + s] === 0) {
                    continue;
                }
                const idx = batchIdx * seqLength * hiddenSize + s * hiddenSize + i;
                values.push(data[idx]);
            }
            embeddings[i] = values.length > 0 ? mean(values) : 0;
        }
        return Array.from(embeddings);
    }
    async _embedCustom(text) {
        if (!this.customEmbedFn) {
            throw new Error("Custom embedder function not initialized");
        }
        return await this.customEmbedFn(text);
    }
}
export default Embedder;
//# sourceMappingURL=embedder.js.map