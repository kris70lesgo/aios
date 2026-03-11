"use client";

import { useState } from "react";
import { format } from "date-fns";
import { studyApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { StudyPlan, StudySession } from "@ai-learning-os/shared";
import { Slider } from "@/components/ui/slider-number-flow";
import { DatePicker } from "@/components/ui/date-picker";

export default function PlannerPage() {
  const [courseId, setCourseId] = useState("");
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
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
      const examDateStr = format(examDate, "yyyy-MM-dd");
      const res = await studyApi.generatePlan(courseId, examDateStr, hoursPerDay);
      setPlan(res.data.plan);
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Study Planner</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Notion Course ID
            </label>
            <input
              type="text"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Paste your Notion course page ID"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400 text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Exam Date
            </label>
            <DatePicker
              date={examDate}
              onDateChange={setExamDate}
              placeholder="Pick your exam date"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-6">
            Hours per day
          </label>
          <div className="px-2">
            <Slider
              min={1}
              max={8}
              step={1}
              value={[hoursPerDay]}
              onValueChange={(v) => setHoursPerDay(v[0])}
              className="w-full"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <ShinyButton
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Building plan..." : "Generate Study Plan"}
        </ShinyButton>
      </div>

      {plan && (
        <div className="space-y-4">
          <div className="flex gap-6 text-sm text-gray-500">
            <span>
              <span className="text-gray-900 font-semibold">{plan.daysLeft}</span> days remaining
            </span>
            <span>
              <span className="text-gray-900 font-semibold">{plan.hoursPerDay}h</span> per day
            </span>
            <span>
              <span className="text-gray-900 font-semibold">{plan.schedule.length}</span> sessions planned
            </span>
          </div>

          {plan.recommendations?.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
              <p className="text-gray-900 font-semibold mb-2">AI Recommendations</p>
              <ul className="space-y-1">
                {plan.recommendations.map((r, i) => (
                  <li key={i} className="text-gray-700">
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
                className={`bg-white border rounded-xl p-4 shadow-sm ${
                  session.isReview ? "border-gray-400" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-500">
                    Day {session.day} — {session.date}
                  </span>
                  {session.isReview && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      Review
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {session.topics.join(", ")}
                </p>
                <p className="text-xs text-gray-400">{session.focus}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
