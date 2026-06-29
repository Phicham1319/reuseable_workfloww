import { createOpenAI } from "@ai-sdk/openai";

/**
 * OpenRouter = OpenAI-compatible → ใช้ provider เดิม เปลี่ยนแค่ baseURL
 * key มาจาก env (local ใส่ใน .env, prod ใส่ใน Vercel)
 */
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/** model default — เปลี่ยนได้ต่อ node ผ่าน config.model */
export const DEFAULT_MODEL = "openai/gpt-4o-mini";
