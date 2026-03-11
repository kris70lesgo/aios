"use client";

import { useState } from "react";
import { aiApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";

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
      setError(e.response?.data?.error || e.message || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Visual Diagrams</h1>
      <p className="text-gray-500 mb-6">
        Generate concept maps, algorithm diagrams, and visual explanations using
        FLUX.2 Max.
      </p>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the diagram you want to generate..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400 text-gray-900 resize-none"
        />

        <div>
          <p className="text-xs text-gray-500 mb-2">Quick presets:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 transition-colors"
              >
                {p.slice(0, 40)}…
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <ShinyButton
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Generating diagram..." : "Generate Diagram"}
        </ShinyButton>
      </div>

      {imageUrl && (
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full h-auto"
          />
          <div className="p-4">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
            >
              Open full size ↗
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

