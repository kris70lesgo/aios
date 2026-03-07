"use client";

import { useState } from "react";
import { aiApi } from "@/lib/api";
import { MessageSquare, Loader2, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt) return;

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiApi.ask(prompt, context || undefined);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.result },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 flex flex-col h-screen">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-7 h-7 text-pink-400" />
        <h1 className="text-3xl font-bold">AI Tutor</h1>
      </div>

      {/* Context input */}
      <details className="glass rounded-xl p-4 mb-4 text-sm">
        <summary className="cursor-pointer text-gray-400 select-none">
          Add notes context (optional — paste relevant study notes)
        </summary>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Paste your notes here to ground AI answers..."
          rows={4}
          className="mt-3 w-full bg-transparent outline-none resize-none text-gray-300 placeholder-gray-600"
        />
      </details>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 py-16">
            <p className="text-lg">Ask anything about your study material.</p>
            <p className="text-sm mt-2">
              e.g. &quot;Explain binary search in simple terms&quot; or &quot;Give me practice problems on recursion&quot;
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "glass text-gray-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl">
              <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-3 glass rounded-2xl p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={2}
          className="flex-1 bg-transparent outline-none resize-none text-sm placeholder-gray-600"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
