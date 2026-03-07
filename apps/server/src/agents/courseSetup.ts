import { generateText } from "../services/openrouter";
import { notionService } from "../services/notion";

interface SetupInput {
  courseName: string;
  syllabus: string;
}

export class CourseSetupAgent {
  async setup({ courseName, syllabus }: SetupInput) {
    // Step 1: Extract topics and modules from the syllabus
    const extractPrompt = `Extract topics from this course syllabus. Return ONLY valid JSON (no markdown, no code fences, no text outside JSON).

Course: "${courseName}"
Syllabus: ${syllabus}

JSON format:
{"description":"one sentence description","difficulty":"Medium","modules":[{"name":"Module name","topics":["Topic 1","Topic 2"]}]}`;

    const raw = await generateText(extractPrompt, 1500);

    let structure: {
      description: string;
      difficulty: string;
      modules: Array<{ name: string; topics: string[] }>;
    };

    try {
      const cleaned = raw.replace(/```[\w]*\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      structure = JSON.parse(jsonMatch?.[0] ?? cleaned);
    } catch {
      throw new Error("Failed to parse course structure from AI response");
    }

    // Step 2: Create the course in Notion
    const course = await notionService.createCourse({
      name: courseName,
      description: structure.description,
      difficulty: structure.difficulty as "Easy" | "Medium" | "Hard",
    });

    // Step 3: Create all topics in Notion
    const createdTopics = [];
    for (const module of structure.modules) {
      for (const topicName of module.topics) {
        const topic = await notionService.createTopic(
          `[${module.name}] ${topicName}`,
          course.id
        );
        createdTopics.push({ name: topicName, module: module.name, id: topic.id });
      }
    }

    return {
      courseId: course.id,
      courseName,
      description: structure.description,
      difficulty: structure.difficulty,
      totalTopics: createdTopics.length,
      modules: structure.modules,
      topics: createdTopics,
    };
  }
}
