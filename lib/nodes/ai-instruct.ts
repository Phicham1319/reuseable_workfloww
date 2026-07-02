import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { ok, type Envelope } from "@/lib/graph";
import { zodFromJson, coerceSchema } from "@/lib/json-schema";
import type { UiNodeDef } from "./types";

const schema = z.object({
  prompt: z.string().min(1),
  outputSchema: z.any(),
  model: z.string().default("gpt-4o-mini"),
  temperature: z.coerce.number().min(0).max(1).default(0.7),
});

/** เติมตัวแปร {{field}} จาก input.data ลงใน prompt */
function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => {
    const value = path
      .split(".")
      .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], data);
    if (value == null) return "";
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  });
}

/**
 * ai.instruct — เรียก LLM ให้คืน JSON ตาม schema ที่กำหนด.
 * ถ้า output ไม่ตรง schema generateObject จะ throw → Inngest retry
 * (ตั้ง retries ที่ function) → ครบแล้ว interpreter จับเป็น failed.
 */
export const aiInstructNode: UiNodeDef = {
  schema,
  meta: {
    label: "AI Instruct",
    description:
      "สั่ง LLM ด้วย prompt แล้วบังคับให้คืน JSON ตาม output schema (structured output)",
  },
  fields: [
    {
      name: "prompt",
      label: "Prompt",
      kind: "textarea",
      required: true,
      placeholder: "วิเคราะห์เรซูเม่นี้: {{resume}}",
      help: "ใช้ {{field}} เพื่อแทรกค่าจาก input.data",
    },
    {
      name: "outputSchema",
      label: "Output schema (JSON)",
      kind: "json",
      required: true,
      placeholder: '{ "decision": { "type": "string", "enum": ["approve", "reject"] }, "score": "number", "reason": "string" }',
      help: "shorthand { field: \"string\" } หรือ JSON Schema ย่อ",
    },
    {
      name: "model",
      label: "Model",
      kind: "text",
      placeholder: "gpt-4o-mini",
    },
    {
      name: "temperature",
      label: "Temperature",
      kind: "slider",
      min: 0,
      max: 1,
      step: 0.1,
      default: 0.7,
      minLabel: "Precise",
      maxLabel: "Creative",
      help: "ต่ำ = ตอบแม่นยำคงเส้นคงวา, สูง = สร้างสรรค์/หลากหลาย",
    },
  ],
  run: async (cfg, input, ctx): Promise<Envelope> => {
    const { prompt, outputSchema, model, temperature } = schema.parse(cfg);
    const zodSchema = zodFromJson(coerceSchema(outputSchema));
    const finalPrompt = `${interpolate(prompt, input.data)}\n\nInput data:\n${JSON.stringify(
      input.data,
      null,
      2,
    )}`;
    ctx.log(`ai.instruct → model=${model} temp=${temperature}`);

    // ถ้าผลลัพธ์ไม่ตรง schema generateObject จะ throw (NoObjectGeneratedError)
    const { object } = await generateObject({
      model: openai(model),
      schema: zodSchema,
      prompt: finalPrompt,
      temperature,
    });

    return ok(object as Record<string, unknown>);
  },
};
