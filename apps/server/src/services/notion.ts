import { Client } from "@notionhq/client";
import type {
  CreateCourseInput,
  LogProgressInput,
  Course,
  Topic,
} from "@ai-learning-os/shared";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const COURSES_DB = process.env.NOTION_COURSES_DB_ID ?? "";
const TOPICS_DB = process.env.NOTION_TOPICS_DB_ID ?? "";
const PROGRESS_DB = process.env.NOTION_PROGRESS_DB_ID ?? "";

export const notionService = {
  async getCourses(): Promise<Course[]> {
    const response = await notion.databases.query({
      database_id: COURSES_DB,
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title?.[0]?.plain_text ?? "",
      description: page.properties.Description?.rich_text?.[0]?.plain_text ?? "",
      examDate: page.properties.ExamDate?.date?.start ?? null,
      difficulty: page.properties.Difficulty?.select?.name ?? "Medium",
    }));
  },

  async getTopics(courseId: string): Promise<Topic[]> {
    const response = await notion.databases.query({
      database_id: TOPICS_DB,
      filter: {
        property: "Course",
        relation: { contains: courseId },
      },
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title?.[0]?.plain_text ?? "",
      courseId,
      mastery: page.properties.Mastery?.number ?? 0,
      status: page.properties.Status?.select?.name ?? "Not Started",
    }));
  },

  async getPage(pageId: string) {
    const [page, blocks] = await Promise.all([
      notion.pages.retrieve({ page_id: pageId }),
      notion.blocks.children.list({ block_id: pageId }),
    ]);

    return { page, blocks: blocks.results };
  },

  async createCourse(input: CreateCourseInput) {
    const page = await notion.pages.create({
      parent: { database_id: COURSES_DB },
      properties: {
        Name: { title: [{ text: { content: input.name } }] },
        Description: {
          rich_text: [{ text: { content: input.description ?? "" } }],
        },
        ...(input.examDate && {
          ExamDate: { date: { start: input.examDate } },
        }),
        Difficulty: {
          select: { name: input.difficulty ?? "Medium" },
        },
      },
    });
    return page;
  },

  async createTopic(name: string, courseId: string) {
    const page = await notion.pages.create({
      parent: { database_id: TOPICS_DB },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        Course: { relation: [{ id: courseId }] },
        Status: { select: { name: "Not Started" } },
        Mastery: { number: 0 },
      },
    });
    return page;
  },

  async logProgress(input: LogProgressInput) {
    const page = await notion.pages.create({
      parent: { database_id: PROGRESS_DB },
      properties: {
        Course: { relation: [{ id: input.courseId }] },
        Topic: { relation: [{ id: input.topicId }] },
        Score: { number: input.score ?? 0 },
        TimeSpent: { number: input.timeSpent ?? 0 },
        Notes: {
          rich_text: [{ text: { content: input.notes ?? "" } }],
        },
        Date: { date: { start: new Date().toISOString().split("T")[0] } },
      },
    });
    return page;
  },

  async updateTopicMastery(topicId: string, mastery: number) {
    await notion.pages.update({
      page_id: topicId,
      properties: {
        Mastery: { number: mastery },
        Status: {
          select: {
            name: mastery >= 80 ? "Mastered" : mastery >= 50 ? "In Progress" : "Needs Review",
          },
        },
      },
    });
  },
};
