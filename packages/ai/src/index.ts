import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ai-learning-os.local",
    "X-Title": "AI Learning OS",
  },
});

/**
 * Generate text using OpenRouter (stepfun/step-3.5-flash:free by default)
 */
export async function generateText(
  prompt: string,
  model = "stepfun/step-3.5-flash:free",
  maxTokens = 1500
): Promise<string> {
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
  });
  return completion.choices[0].message.content ?? "";
}

/**
 * Generate an image using FLUX.2 Max via OpenRouter
 */
export async function generateImage(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<{ url: string }> {
  const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ai-learning-os.local",
      "X-Title": "AI Learning OS",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image-preview",
      prompt,
      n: 1,
      size,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Image generation failed: ${err}`);
  }

  const data = (await response.json()) as { data: Array<{ url: string }> };
  return data.data[0];
}

export { client as openRouterClient };
