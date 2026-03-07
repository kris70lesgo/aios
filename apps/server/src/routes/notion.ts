import { Router, Request, Response } from "express";
import { notionService } from "../services/notion";

const router = Router();

// Get all courses from Notion
router.get("/courses", async (_req: Request, res: Response) => {
  try {
    const courses = await notionService.getCourses();
    return res.json({ courses });
  } catch (error) {
    console.error("Notion courses error:", error);
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Get topics for a course
router.get("/courses/:courseId/topics", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const topics = await notionService.getTopics(courseId);
    return res.json({ topics });
  } catch (error) {
    console.error("Notion topics error:", error);
    return res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// Get notes for a page
router.get("/pages/:pageId", async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const page = await notionService.getPage(pageId);
    return res.json({ page });
  } catch (error) {
    console.error("Notion page error:", error);
    return res.status(500).json({ error: "Failed to fetch page" });
  }
});

// Create a new course entry
router.post("/courses", async (req: Request, res: Response) => {
  try {
    const { name, description, examDate, difficulty } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const course = await notionService.createCourse({
      name,
      description,
      examDate,
      difficulty,
    });
    return res.json({ course });
  } catch (error) {
    console.error("Notion create course error:", error);
    return res.status(500).json({ error: "Failed to create course" });
  }
});

// Create a topic for a course
router.post("/courses/:courseId/topics", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    const topic = await notionService.createTopic(name, courseId);
    return res.json({ topic });
  } catch (error) {
    console.error("Notion create topic error:", error);
    return res.status(500).json({ error: "Failed to create topic" });
  }
});

// Log a progress entry
router.post("/progress", async (req: Request, res: Response) => {
  try {
    const { courseId, topicId, score, timeSpent, notes } = req.body;
    if (!courseId || !topicId) {
      return res.status(400).json({ error: "courseId and topicId are required" });
    }

    const entry = await notionService.logProgress({
      courseId,
      topicId,
      score,
      timeSpent,
      notes,
    });
    return res.json({ entry });
  } catch (error) {
    console.error("Notion progress error:", error);
    return res.status(500).json({ error: "Failed to log progress" });
  }
});

export default router;
