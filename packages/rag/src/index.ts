import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { createHash } from "crypto";

const COLLECTION = "study-materials";
// NVIDIA: Llama Nemotron Embed VL 1B V2 (free) via OpenRouter
// Confirmed output dimension: 2048
const EMBED_MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free";
const VECTOR_SIZE = 2048;

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL ?? "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

// OpenRouter client for embeddings
const embedClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  defaultHeaders: {
    "HTTP-Referer": "https://ai-learning-os.local",
    "X-Title": "AI Learning OS",
  },
});

// Cached vector size — determined on first embed call
let _vectorSize: number | null = null;

/**
 * Qdrant requires IDs to be unsigned integers or UUIDs.
 * Convert an arbitrary string key into a deterministic UUID v5-style hex string.
 */
function toUUID(key: string): string {
  const hash = createHash("sha256").update(key).digest("hex");
  // Format as UUID: 8-4-4-4-12
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join("-");
}

// ─── Collection management ────────────────────────────────────────────────────

async function ensureCollection(vectorSize: number) {
  const { collections } = await qdrant.getCollections();
  const exists = collections.some((c) => c.name === COLLECTION);
  if (!exists) {
    await qdrant.createCollection(COLLECTION, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
  }
}

// ─── Embedding ────────────────────────────────────────────────────────────────

export async function embedText(text: string): Promise<number[]> {
  const response = await embedClient.embeddings.create({
    model: EMBED_MODEL,
    input: text,
  });
  const vector = response.data[0].embedding;
  // Cache the dimension so ensureCollection uses the real size
  if (_vectorSize === null) _vectorSize = vector.length;
  return vector;
}

// ─── Indexing ─────────────────────────────────────────────────────────────────

export async function indexDocument(
  id: string,
  text: string,
  metadata: {
    courseId?: string;
    topicId?: string;
    pageId?: string;
    title?: string;
    [key: string]: unknown;
  }
) {
  const vector = await embedText(text);
  await ensureCollection(_vectorSize ?? VECTOR_SIZE);
  await qdrant.upsert(COLLECTION, {
    // Store original string id in payload; use UUID as Qdrant point id
    points: [{ id: toUUID(id), vector, payload: { text, sourceId: id, ...metadata } }],
  });
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string | number;
  score: number;
  text: string;
  metadata: Record<string, unknown>;
}

export async function searchDocuments(
  query: string,
  topK = 5,
  filter?: { courseId?: string; topicId?: string }
): Promise<SearchResult[]> {
  const vector = await embedText(query);
  await ensureCollection(_vectorSize ?? VECTOR_SIZE);

  const qdrantFilter =
    filter?.courseId || filter?.topicId
      ? {
          must: [
            ...(filter.courseId
              ? [{ key: "courseId", match: { value: filter.courseId } }]
              : []),
            ...(filter.topicId
              ? [{ key: "topicId", match: { value: filter.topicId } }]
              : []),
          ],
        }
      : undefined;

  const results = await qdrant.search(COLLECTION, {
    vector,
    limit: topK,
    with_payload: true,
    filter: qdrantFilter,
  });

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    text: (r.payload?.text as string) ?? "",
    metadata: (r.payload ?? {}) as Record<string, unknown>,
  }));
}

export async function deleteDocumentsBySource(sourceId: string) {
  await ensureCollection(VECTOR_SIZE);
  await qdrant.delete(COLLECTION, {
    filter: {
      must: [{ key: "sourceId", match: { value: sourceId } }],
    },
  });
}

export { qdrant };
