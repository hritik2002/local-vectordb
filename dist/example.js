import VectorDB from "./clientVectorDb.js";
import dotenv from "dotenv";
dotenv.config();
const openaiConfig = {
    type: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-ada-002",
};
const db = new VectorDB({
    dir: "./vdb",
    storeName: "default",
    embedderConfig: openaiConfig,
});
// search
console.log("Testing query: 'Who is Hritik?'");
const result = await db.query({
    query: "Who is Hritik?",
    topK: 3,
});
console.log(result);
//# sourceMappingURL=example.js.map