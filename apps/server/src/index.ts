import "./env"; // must be first — loads .env before any service client is instantiated
import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai";
import notionRoutes from "./routes/notion";
import studyRoutes from "./routes/study";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "AI Learning OS backend running", version: "0.1.0" });
});

// Routes
app.use("/ai", aiRoutes);
app.use("/notion", notionRoutes);
app.use("/study", studyRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
