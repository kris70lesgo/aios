import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ai-learning-os.local",
    "X-Title": "AI Learning OS",
  },
});

const SYSTEM_PROMPT = `You are an intelligent AI tutor embedded in AI Learning OS — a personal learning platform that helps students study smarter.

Your role:
- Help students understand concepts deeply, not just memorize them
- Generate study plans, quiz questions, summaries, and progress insights
- Keep explanations clear, structured, and tailored to the student's level
- When generating JSON (study plans, quizzes, analysis), return ONLY valid JSON — no extra text
- Do NOT act as a general-purpose assistant; stay focused on learning, studying, and academic growth
- Encourage the student, be concise, and always tie answers back to their course goals`;

export async function generateText(
  prompt: string,
  maxTokens = 1500
): Promise<string> {
  // Try OpenRouter first
  try {
    const completion = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
    });
    const content = completion.choices[0].message.content ?? "";
    if (content.trim()) return content;
    console.warn("OpenRouter returned empty — falling back to Gemini");
  } catch (err) {
    console.warn("OpenRouter failed — falling back to Gemini:", (err as Error).message);
  }

  // Fallback: Gemini
  return generateTextWithGemini(prompt, maxTokens);
}

async function generateTextWithGemini(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("Gemini returned empty response");
  return text;
}

export async function generateImage(prompt: string): Promise<{ url: string }> {
  // HF Router — FLUX.1-schnell via HF Inference (free with HF token)
  const raw = await fetch(
    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!raw.ok) {
    const err = await raw.text();
    throw new Error(`Image generation failed (${raw.status}): ${err}`);
  }

  const buffer = Buffer.from(await raw.arrayBuffer());
  const base64 = buffer.toString("base64");
  const contentType = raw.headers.get("content-type") ?? "image/jpeg";
  const dataUrl = `data:${contentType};base64,${base64}`;

  return { url: dataUrl };
}
