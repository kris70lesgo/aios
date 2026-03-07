import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

export default api;

// ─── AI ───────────────────────────────────────────────────────────────────────

export const aiApi = {
  ask: (prompt: string, context?: string) =>
    api.post<{ result: string }>("/ai/ask", { prompt, context }),

  quiz: (topic: string, notes?: string, count = 5) =>
    api.post<{ result: string }>("/ai/quiz", { topic, notes, count }),

  summarize: (content: string, style?: "concise" | "detailed" | "simple") =>
    api.post<{ result: string }>("/ai/summarize", { content, style }),

  image: (prompt: string) =>
    api.post<{ result: { url: string } }>("/ai/image", { prompt }),
};

// ─── Study ────────────────────────────────────────────────────────────────────

export const studyApi = {
  setupCourse: (courseName: string, syllabus: string) =>
    api.post("/study/setup-course", { courseName, syllabus }),

  generatePlan: (courseId: string, examDate: string, hoursPerDay = 2) =>
    api.post("/study/plan", { courseId, examDate, hoursPerDay }),

  analyzeProgress: (courseId: string) =>
    api.get(`/study/analyze/${courseId}`),
};

// ─── Notion  ──────────────────────────────────────────────────────────────────

export const notionApi = {
  getCourses: () => api.get("/notion/courses"),
  getTopics: (courseId: string) => api.get(`/notion/courses/${courseId}/topics`),
  logProgress: (data: {
    courseId: string;
    topicId: string;
    score: number;
    timeSpent: number;
    notes?: string;
  }) => api.post("/notion/progress", data),
};
