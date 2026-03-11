"use client";

import { useState } from "react";
import { aiApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { QuizQuestion } from "@ai-learning-os/shared";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  async function handleGenerate() {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setLoading(true);
    setError("");
    setRevealed(new Set());
    try {
      const res = await aiApi.quiz(topic, notes || undefined, count);
      const raw = res.data.result;
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(jsonMatch?.[0] ?? raw);
      setQuestions(parsed);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  }

  function toggleReveal(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Quiz Generator</h1>

      <div className="space-y-4 mb-8">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic (e.g. Binary Trees, Recursion)"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400 text-gray-900"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your notes here (optional — improves question quality)"
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400 text-gray-900 resize-none"
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">Questions:</label>
          {[3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors border ${
                count === n
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <ShinyButton
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Generating..." : "Generate Quiz"}
        </ShinyButton>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    {q.type === "mcq"
                      ? "Multiple Choice"
                      : q.type === "reasoning"
                      ? "Reasoning"
                      : "Short Answer"}
                  </span>
                  <p className="mt-1 font-medium text-gray-900">{q.question}</p>
                  {q.type === "mcq" && q.options && (
                    <ul className="mt-3 space-y-1">
                      {q.options.map((opt, oi) => (
                        <li key={oi} className="text-sm text-gray-600">{opt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleReveal(i)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-900 transition-colors hover:underline underline-offset-2"
              >
                {revealed.has(i) ? "Hide answer" : "Show answer"}
              </button>
              {revealed.has(i) && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  <p className="text-sm text-gray-900 font-medium">Answer: {q.answer}</p>
                  <p className="text-sm text-gray-500">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

