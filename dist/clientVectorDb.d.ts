import type { VectorDBOptions, QueryOptions, QueryResult, UpsertOptions } from "./types.js";
export declare class VectorDB {
    private embedder;
    private db;
    private storeName;
    private dimension;
    private _init;
    constructor(options: VectorDBOptions);
    private _setup;
    upsert(text: string, options?: UpsertOptions): Promise<string>;
    query(options: QueryOptions): Promise<QueryResult[]>;
}
export default VectorDB;
//# sourceMappingURL=clientVectorDb.d.ts.map