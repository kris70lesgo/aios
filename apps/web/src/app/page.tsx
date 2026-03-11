"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShinyButton } from "@/components/ui/shiny-button";

const features = [
  {
    title: "Course Setup",
    description: "Paste your syllabus and AI auto-builds a structured course in Notion.",
    href: "/setup",
  },
  {
    title: "Quiz Generator",
    description: "AI generates conceptual, MCQ, and coding questions from your notes.",
    href: "/quiz",
  },
  {
    title: "Study Planner",
    description: "Get a day-by-day adaptive study schedule based on your progress.",
    href: "/planner",
  },
  {
    title: "Progress Tracker",
    description: "Visualize mastery levels and get AI recommendations on what to study next.",
    href: "/progress",
  },
  {
    title: "AI Tutor",
    description: "Ask questions and get answers grounded in your own study notes.",
    href: "/tutor",
  },
  {
    title: "Visual Diagrams",
    description: "Generate concept maps and algorithm diagrams using FLUX.2 Max.",
    href: "/diagrams",
  },
];

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-500 mb-6">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
          Powered by OpenRouter × Notion MCP
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-gray-900">
          AI Learning OS
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Your autonomous study system. Drop in your course material, and let AI
          organize, quiz, plan, and adapt your entire learning workflow.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <ShinyButton onClick={() => router.push("/setup")}>
            Set Up a Course
          </ShinyButton>
          <ShinyButton onClick={() => router.push("/tutor")}>
            Ask the AI Tutor
          </ShinyButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-900">{f.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
