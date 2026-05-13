import fs from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import { OpenAI } from "openai";
import { v4 as uuid } from "uuid";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const heygenClient = axios.create({
  baseURL: process.env.HEYGEN_BASE_URL || "https://api.heygen.com",
  headers: {
    "X-Api-Key": process.env.HEYGEN_API_KEY,
    "Content-Type": "application/json"
  }
});

async function fetchLatestTechTopics() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return [
      "AI assistants in productivity tools",
      "New smartphone chip launches",
      "Cloud GPU platform updates"
    ];
  }

  const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=5&apiKey=${apiKey}`;
  const { data } = await axios.get(url);
  return (data.articles || []).map((a) => `${a.title}. ${a.description || ""}`);
}

async function buildScript(topics) {
  const prompt = `Create a fresh 20-30 second YouTube tech short script with highly engaging style.
Rules:
- Must be new and reflect recent technology updates.
- Hook in first sentence.
- 4 short lines max.
- End with CTA.

Topics:
${topics.join("\n")}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8
  });

  return response.choices[0].message.content.trim();
}

async function createHeyGenVideo({ script, imageUrl }) {
  if (!process.env.HEYGEN_API_KEY) {
    throw new Error("HEYGEN_API_KEY is required to generate realistic interactive videos");
  }

  const avatarId = process.env.HEYGEN_AVATAR_ID;
  const voiceId = process.env.HEYGEN_VOICE_ID;

  const { data } = await heygenClient.post("/v2/video/generate", {
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: avatarId,
          avatar_style: "normal"
        },
        voice: {
          type: "text",
          input_text: script,
          voice_id: voiceId
        },
        background: imageUrl
          ? { type: "image", image_url: imageUrl }
          : { type: "color", value: "#0a0f1f" }
      }
    ],
    dimension: { width: 1080, height: 1920 }
  });

  return data?.data?.video_id || data?.video_id;
}

async function pollHeyGenVideo(videoId, timeoutMs = 180000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { data } = await heygenClient.get(`/v1/video_status.get?video_id=${videoId}`);
    const payload = data?.data || data;

    if (payload?.status === "completed" || payload?.status === "success") {
      return payload;
    }
    if (payload?.status === "failed") {
      throw new Error(payload?.error || "HeyGen video generation failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error("Timed out waiting for HeyGen video generation");
}

export async function pipelineFromImage(imagePath) {
  const id = uuid();
  const topics = await fetchLatestTechTopics();
  const script = await buildScript(topics);

  const imageUrl = process.env.DAILY_IMAGE_URL || null;
  const videoId = await createHeyGenVideo({ script, imageUrl });
  const videoStatus = await pollHeyGenVideo(videoId);

  const metadata = {
    id,
    generatedAt: new Date().toISOString(),
    imagePath,
    imageUrl,
    topics,
    script,
    heygenVideoId: videoId,
    videoUrl: videoStatus?.video_url || videoStatus?.url,
    thumbnailUrl: videoStatus?.thumbnail_url || null,
    status: videoStatus?.status
  };

  await fs.writeFile(path.join("data", `${id}.json`), JSON.stringify(metadata, null, 2));
  return metadata;
}
