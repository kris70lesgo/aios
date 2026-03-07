import { generateText } from "../services/openrouter";
import { notionService } from "../services/notion";

interface PlanInput {
  courseId: string;
  examDate: string;
  hoursPerDay: number;
}

export class StudyPlannerAgent {
  async generatePlan({ courseId, examDate, hoursPerDay }: PlanInput) {
    // Fetch topics for this course
    const topics = await notionService.getTopics(courseId);

    if (topics.length === 0) {
      throw new Error("No topics found for this course. Set up the course first.");
    }

    const today = new Date();
    const exam = new Date(examDate);
    const daysLeft = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      throw new Error("Exam date must be in the future");
    }

    const topicList = topics
      .map((t, i) => `${i + 1}. ${t.name} (mastery: ${t.mastery}%, status: ${t.status})`)
      .join("\n");

    const prompt = `Create a study schedule. Return ONLY valid JSON (no markdown, no text outside JSON).

Exam in ${daysLeft} days, ${hoursPerDay}h/day. Topics: ${topicList}

JSON format (include only first 7 days max):
{"totalDays":${daysLeft},"hoursPerDay":${hoursPerDay},"schedule":[{"day":1,"date":"YYYY-MM-DD","topics":["name"],"focus":"goal","isReview":false}],"recommendations":["tip1","tip2"]}`;

    const raw = await generateText(prompt, 2500);
    const cleaned = raw.replace(/```[\w]*\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const plan = JSON.parse(jsonMatch?.[0] ?? cleaned);

    return { courseId, examDate, daysLeft, ...plan };
  }
}
