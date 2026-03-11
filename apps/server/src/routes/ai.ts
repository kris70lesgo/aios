import { Router, Request, Response } from "express";
import { generateText, generateImage } from "../services/openrouter";

const router = Router();

// Ask a question using AI
router.post("/ask", async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const fullPrompt = context
      ? `Context from student notes:\n${context}\n\nQuestion: ${prompt}`
      : prompt;

    const result = await generateText(fullPrompt);
    return res.json({ result });
  } catch (error) {
    console.error("AI ask error:", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
});

// Generate a visual diagram
router.post("/image", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const result = await generateImage(prompt);
    return res.json({ result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("AI image error:", msg);
    return res.status(500).json({ error: msg });
  }
});

// Generate quiz questions from notes
router.post("/quiz", async (req: Request, res: Response) => {
  try {
    const { topic, notes, count = 5 } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "topic is required" });
    }

    const prompt = `Generate ${count} quiz questions for topic: "${topic}".${notes ? `\nStudent notes:\n${notes}` : ""}

Return ONLY a valid JSON array (no markdown, no text outside the array):
[{"type":"mcq","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."},
 {"type":"short","question":"...","answer":"...","explanation":"..."}]`;

    const result = await generateText(prompt, 2000);
    return res.json({ result });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Summarize learning material
router.post("/summarize", async (req: Request, res: Response) => {
  try {
    const { content, style = "concise" } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const stylePrompts: Record<string, string> = {
      concise: "Create a concise bullet-point summary",
      detailed: "Create a detailed structured summary with headings",
      simple: "Explain this in simple terms as if to a beginner",
    };

    const prompt = `${stylePrompts[style] || stylePrompts.concise} of the following material:\n\n${content}`;
    const result = await generateText(prompt);
    return res.json({ result });
  } catch (error) {
    console.error("Summarize error:", error);
    return res.status(500).json({ error: "Failed to summarize content" });
  }
});

export default router;
