// ─── Course & Topic ───────────────────────────────────────────────────────────

export interface Course {
  id: string;
  name: string;
  description: string;
  examDate: string | null;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Topic {
  id: string;
  name: string;
  courseId: string;
  mastery: number; // 0–100
  status: "Not Started" | "In Progress" | "Mastered" | "Needs Review";
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuestionType = "mcq" | "short" | "reasoning";

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  options?: string[]; // only for mcq
  answer: string;
  explanation: string;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressEntry {
  id: string;
  courseId: string;
  topicId: string;
  score: number;
  timeSpent: number; // minutes
  notes: string;
  date: string;
}

// ─── Study Plan ───────────────────────────────────────────────────────────────

export interface StudySession {
  day: number;
  date: string;
  topics: string[];
  focus: string;
  isReview: boolean;
}

export interface StudyPlan {
  courseId: string;
  examDate: string;
  daysLeft: number;
  totalDays: number;
  hoursPerDay: number;
  schedule: StudySession[];
  recommendations: string[];
}

// ─── API Inputs ───────────────────────────────────────────────────────────────

export interface CreateCourseInput {
  name: string;
  description?: string;
  examDate?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export interface LogProgressInput {
  courseId: string;
  topicId: string;
  score?: number;
  timeSpent?: number;
  notes?: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
