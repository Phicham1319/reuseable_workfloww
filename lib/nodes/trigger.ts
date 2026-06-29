import { z } from "zod";
import { ok, type NodeDef } from "@/lib/graph";

/** จุดเริ่ม workflow — ส่ง payload ที่เข้ามาต่อไปยัง node ถัดไป */
export const trigger: NodeDef = {
  // schedule (optional) ใช้โดย scheduler — preset: manual/hourly/daily/weekdays/weekly (UTC)
  schema: z.object({
    schedule: z
      .object({
        preset: z.enum(["manual", "hourly", "daily", "weekdays", "weekly"]),
        at: z.string().optional(),     // "HH:MM" (daily/weekdays/weekly)
        minute: z.number().optional(), // hourly
        days: z.array(z.number()).optional(), // weekly (0=Sun..6=Sat)
      })
      .optional(),
  }),
  meta: { label: "Trigger", description: "จุดเริ่ม workflow (manual / webhook / schedule)", fields: [] },
  retries: 0,
  outputFields: () => [], // payload ภายนอก — เดาไม่ได้ (B fallback ดู NodeRun ล่าสุด)
  run: async (_cfg, input, ctx) => {
    ctx.log(`trigger fired with keys: ${Object.keys(input.data).join(", ") || "(empty)"}`);
    return ok(input.data);
  },
};