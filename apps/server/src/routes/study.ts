import { Router, Request, Response } from "express";
import { StudyPlannerAgent } from "../agents/studyPlanner";
import { CourseSetupAgent } from "../agents/courseSetup";
import { ProgressAnalyzerAgent } from "../agents/progressAnalyzer";

const router = Router();

// Generate a study plan for a course
router.post("/plan", async (req: Request, res: Response) => {
  try {
    const { courseId, examDate, hoursPerDay } = req.body;
    if (!courseId || !examDate) {
      return res.status(400).json({ error: "courseId and examDate are required" });
    }

    const agent = new StudyPlannerAgent();
    const plan = await agent.generatePlan({ courseId, examDate, hoursPerDay: hoursPerDay ?? 2 });
    return res.json({ plan });
  } catch (error) {
    console.error("Study plan error:", error);
    return res.status(500).json({ error: "Failed to generate study plan" });
  }
});

// Auto-setup a course from syllabus text
router.post("/setup-course", async (req: Request, res: Response) => {
  try {
    const { courseName, syllabus } = req.body;
    if (!courseName || !syllabus) {
      return res.status(400).json({ error: "courseName and syllabus are required" });
    }

    const agent = new CourseSetupAgent();
    const result = await agent.setup({ courseName, syllabus });
    return res.json({ result });
  } catch (error) {
    console.error("Course setup error:", error);
    return res.status(500).json({ error: "Failed to set up course" });
  }
});

// Analyze student progress and produce recommendations
router.get("/analyze/:courseId", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const agent = new ProgressAnalyzerAgent();
    const analysis = await agent.analyze(courseId);
    return res.json({ analysis });
  } catch (error) {
    console.error("Progress analysis error:", error);
    return res.status(500).json({ error: "Failed to analyze progress" });
  }
});

export default router;
