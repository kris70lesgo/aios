import { generateText } from "../services/openrouter";
import { notionService } from "../services/notion";

export class ProgressAnalyzerAgent {
  async analyze(courseId: string) {
    const topics = await notionService.getTopics(courseId);

    if (topics.length === 0) {
      throw new Error("No topics found for this course");
    }

    const mastered = topics.filter((t) => t.mastery >= 80);
    const inProgress = topics.filter((t) => t.mastery >= 50 && t.mastery < 80);
    const needsReview = topics.filter((t) => t.mastery < 50);

    const avgMastery =
      topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length;

    const topicSummary = topics
      .map((t) => `- ${t.name}: ${t.mastery}% mastery (${t.status})`)
      .join("\n");

    const prompt = `Analyze student progress. Return ONLY valid JSON (no markdown, no text outside JSON).

Mastery: ${avgMastery.toFixed(1)}%, Topics: ${topics.length} (mastered:${mastered.length}, in-progress:${inProgress.length}, needs-review:${needsReview.length})
Breakdown: ${topicSummary}

JSON format:
{"overallScore":${avgMastery.toFixed(1)},"assessment":"2-3 sentence assessment","weakAreas":["topic1","topic2"],"nextSteps":["action1","action2"],"insight":"motivational tip"}`;

    const raw = await generateText(prompt, 800);
    const cleaned = raw.replace(/```[\w]*\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch?.[0] ?? cleaned);

    return {
      courseId,
      stats: {
        total: topics.length,
        mastered: mastered.length,
        inProgress: inProgress.length,
        needsReview: needsReview.length,
        averageMastery: parseFloat(avgMastery.toFixed(1)),
      },
      ...analysis,
    };
  }
}
