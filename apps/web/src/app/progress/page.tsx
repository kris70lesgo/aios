"use client";

import { useState } from "react";
import { studyApi } from "@/lib/api";
import { BarChart3, Loader2 } from "lucide-react";

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
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-7 h-7 text-yellow-400" />
        <h1 className="text-3xl font-bold">Progress Tracker</h1>
      </div>

      <div className="space-y-4 mb-8">
        <input
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Notion Course ID"
          className="w-full px-4 py-3 rounded-xl glass bg-transparent outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-600"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 font-semibold transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Analyzing..." : "Analyze Progress"}
        </button>
      </div>

      {analysis && (
        <div className="space-y-5">
          {/* Overall score */}
          <div className="glass rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-1">Overall Mastery</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-yellow-400">
                {analysis.overallScore}%
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all"
                style={{ width: `${analysis.overallScore}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Mastered", value: analysis.stats.mastered, color: "text-green-400" },
              { label: "In Progress", value: analysis.stats.inProgress, color: "text-blue-400" },
              { label: "Needs Review", value: analysis.stats.needsReview, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.assessment}</p>
            <p className="text-sm italic text-yellow-300">{analysis.insight}</p>
          </div>

          {analysis.weakAreas?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-semibold text-red-400 mb-2">Weak Areas to Focus On</p>
              <ul className="space-y-1">
                {analysis.weakAreas.map((a: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300">• {a}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.nextSteps?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-semibold text-green-400 mb-2">Next Steps</p>
              <ul className="space-y-1">
                {analysis.nextSteps.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
