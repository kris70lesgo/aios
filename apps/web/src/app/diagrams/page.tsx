"use client";

import { useState } from "react";
import { aiApi } from "@/lib/api";
import { Zap, Loader2 } from "lucide-react";
import Image from "next/image";

const PRESETS = [
  "A diagram showing Binary Tree traversal (inorder, preorder, postorder)",
  "Visual concept map of sorting algorithms and their time complexities",
  "System architecture diagram for a REST API with database",
  "Step by step illustration of how recursion works on a call stack",
];

export default function DiagramsPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setLoading(true);
    setError("");
    setImageUrl("");
    try {
      const res = await aiApi.image(prompt);
      setImageUrl(res.data.result.url);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Zap className="w-7 h-7 text-orange-400" />
        <h1 className="text-3xl font-bold">Visual Diagrams</h1>
      </div>
      <p className="text-gray-400 mb-6">
        Generate concept maps, algorithm diagrams, and visual explanations using
        FLUX.2 Max.
      </p>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the diagram you want to generate..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl glass bg-transparent outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600 resize-none"
        />

        <div>
          <p className="text-xs text-gray-500 mb-2">Quick presets:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs px-3 py-1.5 rounded-lg glass hover:bg-white/10 text-gray-400 transition-colors"
              >
                {p.slice(0, 40)}…
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 font-semibold transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Generating diagram..." : "Generate Diagram"}
        </button>
      </div>

      {imageUrl && (
        <div className="mt-8 glass rounded-2xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={prompt}
            width={1024}
            height={1024}
            className="w-full h-auto"
          />
          <div className="p-4">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-400 hover:underline"
            >
              Open full size ↗
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
