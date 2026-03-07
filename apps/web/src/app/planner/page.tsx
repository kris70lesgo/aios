"use client";

import { useState } from "react";
import { studyApi } from "@/lib/api";
import { Calendar, Loader2 } from "lucide-react";
import type { StudyPlan, StudySession } from "@ai-learning-os/shared";

export default function PlannerPage() {
  const [courseId, setCourseId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!courseId.trim() || !examDate) {
      setError("Please enter a course ID and exam date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await studyApi.generatePlan(courseId, examDate, hoursPerDay);
      setPlan(res.data.plan);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="w-7 h-7 text-green-400" />
        <h1 className="text-3xl font-bold">Study Planner</h1>
      </div>

      <div className="glass rounded-2xl p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Notion Course ID
            </label>
            <input
              type="text"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Paste your Notion course page ID"
              className="w-full px-4 py-3 rounded-xl glass bg-transparent outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass bg-transparent outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Hours per day: {hoursPerDay}h
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 font-semibold transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Building plan..." : "Generate Study Plan"}
        </button>
      </div>

      {plan && (
        <div className="space-y-4">
          <div className="flex gap-6 text-sm text-gray-400">
            <span>
              <span className="text-white font-semibold">{plan.daysLeft}</span> days remaining
            </span>
            <span>
              <span className="text-white font-semibold">{plan.hoursPerDay}h</span> per day
            </span>
            <span>
              <span className="text-white font-semibold">{plan.schedule.length}</span> sessions planned
            </span>
          </div>

          {plan.recommendations?.length > 0 && (
            <div className="glass rounded-xl p-4 text-sm">
              <p className="text-green-400 font-semibold mb-2">AI Recommendations</p>
              <ul className="space-y-1">
                {plan.recommendations.map((r, i) => (
                  <li key={i} className="text-gray-300">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.schedule.map((session: StudySession) => (
              <div
                key={session.day}
                className={`glass rounded-xl p-4 ${session.isReview ? "border border-yellow-500/30" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-400">
                    Day {session.day} — {session.date}
                  </span>
                  {session.isReview && (
                    <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                      Review
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-green-300 mb-1">
                  {session.topics.join(", ")}
                </p>
                <p className="text-xs text-gray-500">{session.focus}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
