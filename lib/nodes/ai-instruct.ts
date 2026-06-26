import { z } from "zod";
import { generateObject } from "ai";
import { openrouter, DEFAULT_MODEL } from "@/lib/ai";
import { ok, type NodeDef } from "@/lib/graph";

/** field type ที่รองรับใน v1 (flat) */
const FieldType = z.enum(["string", "number", "boolean"]);

/**
 * แปลง field list → zod object
 * [{name:"decision", type:"string", description:"..."}] → z.object({ decision: z.string().describe("...") })
 */
function buildSchema(
  fields: { name: string; type: "string" | "number" | "boolean"; description?: string }[],
) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    const base =
      f.type === "number" ? z.number() : f.type === "boolean" ? z.boolean() : z.string();
    shape[f.name] = f.description ? base.describe(f.description) : base;
  }
  return z.object(shape);
}

/**
 * AI node — ให้ AI ทำงานแล้วคืน JSON ตาม schema (structured-by-default, fail-loud)
 * - มี outputSchema (field list) → คืน object ตาม schema
 * - ไม่มี outputSchema → "โหมด text" คืน { text: string } (เริ่มง่ายสำหรับ non-tech)
 */
export const aiInstruct: NodeDef = {
  schema: z.object({
    prompt: z.string(),
    model: z.string().optional(),
    outputSchema: z
      .array(
        z.object({
          name: z.string(),
          type: FieldType,
          description: z.string().optional(),
        }),
      )
      .optional(),
  }),
  meta: {
    label: "AI Instruct",
    description: "ให้ AI ประมวลผลข้อมูลแล้วคืนผลลัพธ์ (ระบุ field ที่อยากได้ หรือเว้นว่างเพื่อรับข้อความ)",
  },
  retries: 2, // randomness → retry มักผ่าน
  run: async (cfg, input) => {
    const schema =
      cfg.outputSchema && cfg.outputSchema.length > 0
        ? buildSchema(cfg.outputSchema)
        : z.object({ text: z.string() }); // โหมด text

    const { object } = await generateObject({
      model: openrouter.chat(cfg.model ?? DEFAULT_MODEL),
      schema,
      prompt: `${cfg.prompt}\n\nINPUT DATA:\n${JSON.stringify(input.data)}`,
    });

    return ok(object as Record<string, unknown>);
  },
};
