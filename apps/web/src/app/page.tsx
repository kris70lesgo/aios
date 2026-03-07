"use client";

import Link from "next/link";
import { BookOpen, Brain, Calendar, BarChart3, MessageSquare, Zap } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Setup",
    description: "Paste your syllabus and AI auto-builds a structured course in Notion.",
    href: "/setup",
    color: "text-blue-400",
  },
  {
    icon: Brain,
    title: "Quiz Generator",
    description: "AI generates conceptual, MCQ, and coding questions from your notes.",
    href: "/quiz",
    color: "text-purple-400",
  },
  {
    icon: Calendar,
    title: "Study Planner",
    description: "Get a day-by-day adaptive study schedule based on your progress.",
    href: "/planner",
    color: "text-green-400",
  },
  {
    icon: BarChart3,
    title: "Progress Tracker",
    description: "Visualize mastery levels and get AI recommendations on what to study next.",
    href: "/progress",
    color: "text-yellow-400",
  },
  {
    icon: MessageSquare,
    title: "AI Tutor",
    description: "Ask questions and get answers grounded in your own study notes.",
    href: "/tutor",
    color: "text-pink-400",
  },
  {
    icon: Zap,
    title: "Visual Diagrams",
    description: "Generate concept maps and algorithm diagrams using FLUX.2 Max.",
    href: "/diagrams",
    color: "text-orange-400",
  },
];

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-gray-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Powered by OpenRouter × Notion MCP
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          AI Learning OS
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Your autonomous study system. Drop in your course material, and let AI
          organize, quiz, plan, and adapt your entire learning workflow.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/setup"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-colors"
          >
            Set Up a Course
          </Link>
          <Link
            href="/tutor"
            className="px-6 py-3 rounded-xl glass hover:bg-white/10 font-semibold transition-colors"
          >
            Ask the AI Tutor
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors group"
          >
            <f.icon className={`w-8 h-8 mb-4 ${f.color}`} />
            <h2 className="text-lg font-semibold mb-2 group-hover:text-white">
              {f.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
