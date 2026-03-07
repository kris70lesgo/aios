#!/usr/bin/env node
/**
 * scripts/test-all.mjs
 * Smoke-tests every service: OpenRouter text, OpenRouter embedding, Qdrant, Notion.
 * Run: node scripts/test-all.mjs
 */

import "dotenv/config";
import { createHash } from "crypto";

const OR_KEY = process.env.OPENROUTER_API_KEY;
const OR_BASE = "https://openrouter.ai/api/v1";
const EMBED_MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free";
const TEXT_MODEL = "openai/gpt-oss-120b";

const HEADERS = {
  Authorization: `Bearer ${OR_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://ai-learning-os.local",
  "X-Title": "AI Learning OS",
};

function toUUID(key) {
  const hash = createHash("sha256").update(key).digest("hex");
  return [hash.slice(0,8), hash.slice(8,12), hash.slice(12,16), hash.slice(16,20), hash.slice(20,32)].join("-");
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const ok = (label) => console.log(`  ✓ ${label}`);
const fail = (label, err) => console.error(`  ✗ ${label}\n    ${err}`);

async function section(name, fn) {
  console.log(`\n▶ ${name}`);
  try {
    await fn();
  } catch (e) {
    fail("Unhandled", e.message ?? e);
  }
}

// ─── 1. OpenRouter text generation ────────────────────────────────────────────
await section("OpenRouter — text generation", async () => {
  const res = await fetch(`${OR_BASE}/chat/completions`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [{ role: "user", content: "Explain binary search in one sentence." }],
      max_tokens: 60,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const reply = data.choices?.[0]?.message?.content ?? "(empty)";
  ok(`Response: "${reply.trim().slice(0, 120)}"`);
});

// ─── 2. OpenRouter embeddings ─────────────────────────────────────────────────
let vectorSize = 0;
await section("OpenRouter — embeddings (Nemotron)", async () => {
  const res = await fetch(`${OR_BASE}/embeddings`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: "Binary tree traversal algorithms",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const vec = data.data?.[0]?.embedding;
  if (!Array.isArray(vec)) throw new Error("No embedding array in response: " + JSON.stringify(data));
  vectorSize = vec.length;
  ok(`Vector dimension: ${vectorSize}`);
  ok(`First 5 values: [${vec.slice(0, 5).map((v) => v.toFixed(4)).join(", ")}]`);
});

// ─── 3. Qdrant connectivity ───────────────────────────────────────────────────
await section("Qdrant — connectivity + collection", async () => {
  const QDRANT_URL = process.env.QDRANT_URL;
  const QDRANT_KEY = process.env.QDRANT_API_KEY;
  if (!QDRANT_URL) throw new Error("QDRANT_URL not set");

  const qHeaders = {
    "Content-Type": "application/json",
    ...(QDRANT_KEY ? { "api-key": QDRANT_KEY } : {}),
  };

  // List collections
  const listRes = await fetch(`${QDRANT_URL}/collections`, { headers: qHeaders });
  const listData = await listRes.json();
  if (!listRes.ok) throw new Error(JSON.stringify(listData));
  ok(`Connected. Collections: ${listData.result?.collections?.map((c) => c.name).join(", ") || "(none)"}`);

  if (vectorSize === 0) {
    ok("Skipping collection create — embedding step failed");
    return;
  }

  // Create/verify study-materials collection
  const COLLECTION = "study-materials";
  const exists = listData.result?.collections?.some((c) => c.name === COLLECTION);
  if (!exists) {
    const createRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
      method: "PUT",
      headers: qHeaders,
      body: JSON.stringify({
        vectors: { size: vectorSize, distance: "Cosine" },
      }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(JSON.stringify(createData));
    ok(`Created collection "${COLLECTION}" (dim=${vectorSize})`);
  } else {
    ok(`Collection "${COLLECTION}" already exists`);
  }

  // Upsert a test point using UUID id
  const testUUID = toUUID("smoke-test-point-001");
  const upsertRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: "PUT",
    headers: qHeaders,
    body: JSON.stringify({
      points: [
        {
          id: testUUID,
          vector: Array(vectorSize).fill(0).map(() => Math.random()),
          payload: { text: "test point", sourceId: "smoke-test-point-001" },
        },
      ],
    }),
  });
  const upsertData = await upsertRes.json();
  if (!upsertRes.ok) throw new Error(JSON.stringify(upsertData));
  ok(`Upserted test point (id=${testUUID}) into "${COLLECTION}"`);
});

// ─── 4. Notion connectivity ───────────────────────────────────────────────────
await section("Notion — connectivity + databases", async () => {
  const NOTION_KEY = process.env.NOTION_API_KEY;
  if (!NOTION_KEY) throw new Error("NOTION_API_KEY not set");

  const nHeaders = {
    Authorization: `Bearer ${NOTION_KEY}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  const dbIds = {
    Courses: process.env.NOTION_COURSES_DB_ID,
    Topics: process.env.NOTION_TOPICS_DB_ID,
    Progress: process.env.NOTION_PROGRESS_DB_ID,
  };

  for (const [name, id] of Object.entries(dbIds)) {
    if (!id) { fail(`${name} DB`, "ID not set in .env"); continue; }
    const res = await fetch(`https://api.notion.com/v1/databases/${id}`, { headers: nHeaders });
    const data = await res.json();
    if (!res.ok) { fail(`${name} DB (${id})`, data.message ?? JSON.stringify(data)); continue; }
    ok(`${name} DB: "${data.title?.[0]?.plain_text ?? data.id}"`);
  }
});

console.log("\n─────────────────────────────────────────────\n");
