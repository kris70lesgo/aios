"use client";

import { useState } from "react";
import { studyApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import TextareaWithFloatingLabel from "@/components/ui/textarea-with-floating-label";
import InputWithFloatingLabel from "@/components/ui/input-with-floating-label";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function SetupPage() {
  const [courseName, setCourseName] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSetup() {
    if (!courseName.trim() || !syllabus.trim()) {
      setError("Please fill in both course name and syllabus.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await studyApi.setupCourse(courseName, syllabus);
      setResult(res.data.result);
    } catch (e: any) {
      setError(e.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Setup</h1>
      <p className="text-gray-500 mb-8">
        Paste your syllabus below. AI will extract modules and topics and create
        a structured course in your Notion workspace automatically.
      </p>

      <div className="space-y-4">
        <InputWithFloatingLabel
          label="Course Name"
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-gray-300 h-12"
          containerClassName="w-full"
        />

        <TextareaWithFloatingLabel
          label="Syllabus / Course Outline"
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
          rows={12}
          className="resize-none rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-gray-300"
          containerClassName="w-full"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <ShinyButton
          onClick={handleSetup}
          disabled={loading}
          className="flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Setting up course..." : "Set Up Course in Notion"}
        </ShinyButton>
      </div>

      {result && (
        <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            ✓ Course created in Notion!
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="text-gray-400">Course:</span> {result.courseName}</p>
            <p><span className="text-gray-400">Difficulty:</span> {result.difficulty}</p>
            <p><span className="text-gray-400">Total topics:</span> {result.totalTopics}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Modules:</p>
            <ul className="space-y-2">
              {result.modules?.map((m: any, i: number) => (
                <li key={i} className="text-sm">
                  <span className="text-gray-900 font-medium">{m.name}</span>
                  <span className="text-gray-400"> — {m.topics.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
