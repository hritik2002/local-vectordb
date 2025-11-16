import fs from "fs/promises";
import path from "path";
import pkg from 'hnswlib-node';
const { HierarchicalNSW } = pkg;
import { cosineSimilarity } from "fast-cosine-similarity";
class LocalVectorDB {
    dir;
    autosave;
    stores;
    _initPromise;
    constructor({ dir = "./local_vector_db", autosave = true, } = {}) {
        this.dir = dir;
        this.autosave = autosave;
        this.stores = new Map();
        this._initPromise = this._ensureDir();
    }
    async _ensureDir() {
        await fs.mkdir(this.dir, { recursive: true });
        const files = await fs.readdir(this.dir);
        for (const file of files) {
            if (file.endsWith(".json")) {
                try {
                    const full = path.join(this.dir, file);
                    const parsed = JSON.parse(await fs.readFile(full, "utf8"));
                    const { storeName, dimension, items, } = parsed;
                    const index = new HierarchicalNSW("cosine", dimension);
                    const maxElements = Math.max(items.length * 2, 1000);
                    index.initIndex(maxElements);
                    const map = new Map();
                    const indexToId = new Map();
                    const idToIndex = new Map();
                    let nextIndex = 0;
                    for (const it of items) {
                        const vec = Float32Array.from(it.vector);
                        map.set(it.id, {
                            vector: vec,
                            metadata: it.metadata,
                            text: it.text,
                        });
                        index.addPoint(Array.from(vec), nextIndex);
                        indexToId.set(nextIndex, it.id);
                        idToIndex.set(it.id, nextIndex);
                        nextIndex++;
                    }
                    this.stores.set(storeName, {
                        dimension,
                        items: map,
                        index,
                        indexToId,
                        idToIndex,
                        nextIndex,
                        dirty: false,
                        filename: full,
                    });
                }
                catch (error) {
                    console.error(`Error parsing file ${file}:`, error);
                }
            }
        }
    }
    ready() {
        return this._initPromise;
    }
    _file(storeName) {
        return path.join(this.dir, `${storeName}.json`);
    }
    async createStore(name, dimension) {
        await this.ready();
        if (this.stores.has(name))
            return;
        const filename = this._file(name);
        const index = new HierarchicalNSW("cosine", dimension);
        index.initIndex(1000);
        this.stores.set(name, {
            dimension,
            items: new Map(),
            index,
            indexToId: new Map(),
            idToIndex: new Map(),
            nextIndex: 0,
            dirty: true,
            filename,
        });
        if (this.autosave)
            await this._save(name);
    }
    async _save(name) {
        const s = this.stores.get(name);
        if (!s)
            throw new Error(`Store ${name} not found`);
        const payload = {
            storeName: name,
            dimension: s.dimension,
            items: Array.from(s.items.entries()).map(([id, val]) => ({
                id,
                vector: [...val.vector],
                metadata: val.metadata,
                text: val.text,
            })),
        };
        await fs.writeFile(s.filename, JSON.stringify(payload), "utf8");
        s.dirty = false;
    }
    async upsert(name, id, vector, metadata, text) {
        await this.ready();
        const s = this.stores.get(name);
        if (!s)
            throw new Error(`Store ${name} not found`);
        const vec = Float32Array.from(vector);
        if (vec.length !== s.dimension)
            throw new Error("Vector dim mismatch");
        if (s.idToIndex.has(id)) {
            const oldIndex = s.idToIndex.get(id);
            s.indexToId.delete(oldIndex);
        }
        const indexNum = s.nextIndex++;
        s.index.addPoint(Array.from(vec), indexNum);
        s.indexToId.set(indexNum, id);
        s.idToIndex.set(id, indexNum);
        s.items.set(id, { vector: vec, metadata, text });
        s.dirty = true;
        if (this.autosave)
            await this._save(name);
    }
    async query(name, vector, k) {
        await this.ready();
        const s = this.stores.get(name);
        if (!s)
            throw new Error(`Store ${name} not found`);
        if (s.nextIndex === 0) {
            return [];
        }
        const q = Float32Array.from(vector);
        const searchResult = s.index.searchKnn(Array.from(q), Math.min(k, s.nextIndex));
        const results = [];
        for (let i = 0; i < searchResult.neighbors.length; i++) {
            const hnswIndex = searchResult.neighbors[i];
            const distance = searchResult.distances[i];
            const id = s.indexToId.get(hnswIndex);
            if (!id)
                continue;
            const item = s.items.get(id);
            if (!item)
                continue;
            const score = Math.max(0, Math.min(1, 1 - distance));
            results.push({
                id,
                score,
                metadata: item.metadata,
                text: item.text,
            });
        }
        results.sort((a, b) => b.score - a.score);
        return results;
    }
    static cosSim(a, b) {
        return cosineSimilarity(Array.from(a), Array.from(b));
    }
}
export default LocalVectorDB;
//# sourceMappingURL=localVectorDb.js.map