import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL ?? "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION = "study-materials";

export const vectorService = {
  async ensureCollection() {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION);

    if (!exists) {
      await qdrant.createCollection(COLLECTION, {
        vectors: { size: 1536, distance: "Cosine" },
      });
    }
  },

  async upsert(id: string, vector: number[], payload: Record<string, unknown>) {
    await this.ensureCollection();
    await qdrant.upsert(COLLECTION, {
      points: [{ id, vector, payload }],
    });
  },

  async search(vector: number[], topK = 5) {
    await this.ensureCollection();
    const results = await qdrant.search(COLLECTION, {
      vector,
      limit: topK,
      with_payload: true,
    });
    return results;
  },

  async deleteBySource(sourceId: string) {
    await qdrant.delete(COLLECTION, {
      filter: {
        must: [{ key: "sourceId", match: { value: sourceId } }],
      },
    });
  },
};
