declare class LocalVectorDB {
    private dir;
    private autosave;
    private stores;
    private _initPromise;
    constructor({ dir, autosave, }?: {
        dir?: string;
        autosave?: boolean;
    });
    private _ensureDir;
    ready(): Promise<void>;
    private _file;
    createStore(name: string, dimension: number): Promise<void>;
    private _save;
    upsert(name: string, id: string, vector: number[], metadata: Record<string, any>, text: string): Promise<void>;
    query(name: string, vector: number[], k: number): Promise<Array<{
        id: string;
        score: number;
        metadata: Record<string, any>;
        text: string;
    }>>;
    static cosSim(a: Float32Array, b: Float32Array): number;
}
export default LocalVectorDB;
//# sourceMappingURL=localVectorDb.d.ts.map