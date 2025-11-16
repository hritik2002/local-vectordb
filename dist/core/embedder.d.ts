import type { IEmbedder, EmbedderConfig } from "../types.js";
export declare class Embedder implements IEmbedder {
    dimension: number;
    private config;
    private openaiClient?;
    private xenovaTokenizer?;
    private xenovaModel?;
    private customEmbedFn?;
    constructor(config: EmbedderConfig);
    private _initOpenAI;
    private _initXenova;
    private _initCustom;
    embed(text: string): Promise<number[]>;
    private _embedOpenAI;
    private _embedXenova;
    private _embedCustom;
}
export default Embedder;
//# sourceMappingURL=embedder.d.ts.map