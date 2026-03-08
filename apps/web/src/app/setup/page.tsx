"use client";

import { useState } from "react";
import { studyApi } from "@/lib/api";
import { BookOpen, Loader2 } from "lucide-react";
import TextareaWithFloatingLabel from "@/components/ui/textarea-with-floating-label";
import InputWithFloatingLabel from "@/components/ui/input-with-floating-label";

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
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-7 h-7 text-blue-400" />
        <h1 className="text-3xl font-bold">Course Setup</h1>
      </div>
      <p className="text-gray-400 mb-8">
        Paste your syllabus below. AI will extract modules and topics and create
        a structured course in your Notion workspace automatically.
      </p>

      <div className="space-y-4">
        <div>
          <InputWithFloatingLabel
            label="Course Name"
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm text-gray-100 placeholder:text-transparent focus-visible:ring-white/20 h-12"
            containerClassName="w-full"
          />
        </div>

        <div>
          <TextareaWithFloatingLabel
            label="Syllabus / Course Outline"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={12}
            className="resize-none rounded-xl border-white/10 bg-white/5 backdrop-blur-sm text-gray-100 placeholder:text-transparent focus-visible:ring-white/20"
            containerClassName="w-full"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Setting up course..." : "Set Up Course in Notion"}
        </button>
      </div>

      {result && (
        <div className="mt-10 glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-green-400">
            ✓ Course created in Notion!
          </h2>
          <div className="text-sm text-gray-300 space-y-1">
            <p>
              <span className="text-gray-500">Course:</span> {result.courseName}
            </p>
            <p>
              <span className="text-gray-500">Difficulty:</span>{" "}
              {result.difficulty}
            </p>
            <p>
              <span className="text-gray-500">Total topics:</span>{" "}
              {result.totalTopics}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Modules:</p>
            <ul className="space-y-2">
              {result.modules?.map((m: any, i: number) => (
                <li key={i} className="text-sm">
                  <span className="text-blue-400 font-medium">{m.name}</span>
                  <span className="text-gray-500">
                    {" "}
                    — {m.topics.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
