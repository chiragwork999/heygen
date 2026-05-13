import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipelineFromImage } from "./services/pipeline.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.post("/api/generate", async (req, res) => {
  const { imagePath } = req.body;

  if (!imagePath) {
    return res.status(400).json({ error: "imagePath is required" });
  }

  try {
    const result = await pipelineFromImage(imagePath);
    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

const schedule = process.env.RUN_SCHEDULE || "0 8 * * *";
cron.schedule(schedule, async () => {
  try {
    const defaultImage = path.join(__dirname, "..", "public", "uploads", "today.jpg");
    await pipelineFromImage(defaultImage);
    console.log("Daily short generated successfully");
  } catch (error) {
    console.error("Daily generation failed:", error.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
