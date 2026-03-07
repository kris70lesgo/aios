# AI Learning OS

> Autonomous Study System powered by Notion MCP + OpenRouter

AI Learning OS transforms Notion into an intelligent learning command center. AI agents analyze course material, generate quizzes, build study plans, and track progress — all written back to your Notion workspace automatically.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| AI Text | OpenRouter → `openai/gpt-oss-120b` |
| AI Images | OpenRouter → `black-forest-labs/flux-2-max` |
| Knowledge Base | Notion MCP (`@notionhq/client`) |
| Vector Search | Qdrant (optional for RAG) |
| Monorepo | Turborepo |

---

## Project Structure

```
ai-learning-os/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── server/       # Express backend (port 4000)
├── packages/
│   ├── ai/           # OpenRouter client (text + image)
│   ├── notion/       # Notion SDK utilities
│   ├── rag/          # Qdrant vector search + embeddings
│   └── shared/       # TypeScript types shared across apps
├── .env.example
└── turbo.json
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-learning-os
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:

- `OPENROUTER_API_KEY` — get one at [openrouter.ai](https://openrouter.ai)
- `NOTION_API_KEY` — create an integration at [notion.so/my-integrations](https://notion.so/my-integrations)
- `NOTION_COURSES_DB_ID`, `NOTION_TOPICS_DB_ID`, `NOTION_PROGRESS_DB_ID` — your Notion database IDs

### 3. Set up Notion databases

Create three databases in Notion and share them with your integration:

**Courses DB** — properties: `Name` (title), `Description` (text), `ExamDate` (date), `Difficulty` (select: Easy/Medium/Hard)

**Topics DB** — properties: `Name` (title), `Course` (relation → Courses), `Status` (select), `Mastery` (number)

**Progress DB** — properties: `Course` (relation), `Topic` (relation), `Score` (number), `TimeSpent` (number), `Notes` (text), `Date` (date)

### 4. Run development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

---

## Features

| Feature | Route | Description |
|---|---|---|
| Course Setup | `/setup` | Paste syllabus → AI extracts topics → creates Notion entries |
| Quiz Generator | `/quiz` | AI generates MCQ, short answer, and reasoning questions |
| Study Planner | `/planner` | Adaptive day-by-day schedule based on exam date + mastery |
| Progress Tracker | `/progress` | AI analysis of weak areas and next steps |
| AI Tutor | `/tutor` | Conversational Q&A grounded in your own notes |
| Visual Diagrams | `/diagrams` | FLUX.2 Max generates concept maps and algorithm visuals |

---

## API Endpoints

### AI
| Method | Path | Description |
|---|---|---|
| POST | `/ai/ask` | Ask a question (with optional notes context) |
| POST | `/ai/quiz` | Generate quiz questions for a topic |
| POST | `/ai/summarize` | Summarize learning material |
| POST | `/ai/image` | Generate a visual diagram |

### Study Agents
| Method | Path | Description |
|---|---|---|
| POST | `/study/setup-course` | Auto-setup course from syllabus |
| POST | `/study/plan` | Generate study schedule |
| GET | `/study/analyze/:courseId` | Analyze progress for a course |

### Notion
| Method | Path | Description |
|---|---|---|
| GET | `/notion/courses` | List all courses |
| GET | `/notion/courses/:id/topics` | Get topics for a course |
| POST | `/notion/courses` | Create a course |
| POST | `/notion/progress` | Log a study session |

---

## License

MIT
