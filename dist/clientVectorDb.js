import Embedder from "./core/embedder.js";
import LocalVectorDB from "./core/localVectorDb.js";
export class VectorDB {
    embedder;
    db;
    storeName;
    dimension;
    _init;
    constructor(options) {
        const { dir = "./vdb", storeName = "default", dimension, embedderConfig } = options;
        this.embedder = new Embedder(embedderConfig);
        this.db = new LocalVectorDB({ dir, autosave: true });
        this.storeName = storeName;
        this.dimension = dimension || this.embedder.dimension;
        this._init = this._setup();
    }
    async _setup() {
        // Use embedder's dimension if not explicitly provided
        this.dimension = this.dimension || this.embedder.dimension;
        await this.db.createStore(this.storeName, this.dimension);
    }
    async upsert(text, options = {}) {
        await this._init;
        const { metadata = {} } = options;
        const vector = await this.embedder.embed(text);
        if (vector.length !== this.dimension) {
            throw new Error(`Embedder produced ${vector.length} dims, expected ${this.dimension}`);
        }
        const id = `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        await this.db.upsert(this.storeName, id, vector, metadata, text);
        return id;
    }
    async query(options) {
        await this._init;
        const { query, topK = 5 } = options;
        const vector = await this.embedder.embed(query);
        return this.db.query(this.storeName, vector, topK);
    }
}
export default VectorDB;
//# sourceMappingURL=clientVectorDb.js.map