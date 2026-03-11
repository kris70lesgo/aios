"use client";

import { useState } from "react";
import { studyApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function ProgressPage() {
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!courseId.trim()) {
      setError("Please enter a course ID.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await studyApi.analyzeProgress(courseId);
      setAnalysis(res.data.analysis);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to analyze progress.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Progress Tracker</h1>

      <div className="space-y-4 mb-8">
        <input
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Notion Course ID"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400 text-gray-900"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <ShinyButton
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Analyzing..." : "Analyze Progress"}
        </ShinyButton>
      </div>

      {analysis && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Overall Mastery</p>
            <span className="text-5xl font-bold text-gray-900">
              {analysis.overallScore}%
            </span>
            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gray-900 transition-all"
                style={{ width: `${analysis.overallScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Mastered", value: analysis.stats.mastered },
              { label: "In Progress", value: analysis.stats.inProgress },
              { label: "Needs Review", value: analysis.stats.needsReview },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.assessment}</p>
            <p className="text-sm italic text-gray-500">{analysis.insight}</p>
          </div>

          {analysis.weakAreas?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-2">Weak Areas to Focus On</p>
              <ul className="space-y-1">
                {analysis.weakAreas.map((a: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600">• {a}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.nextSteps?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-2">Next Steps</p>
              <ul className="space-y-1">
                {analysis.nextSteps.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

