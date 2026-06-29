import { z } from "zod";
import { ok } from "@/lib/graph";
import type { UiNodeDef } from "./types";

/**
 * trigger — จุดเริ่มของ workflow.
 * รับ payload จาก event (interpreter เอามาเป็น input ของ node แรก)
 * แล้วส่งต่อ data ตามเดิม
 */
export const triggerNode: UiNodeDef = {
  schema: z.object({}).passthrough(),
  meta: {
    label: "Trigger",
    description: "จุดเริ่มของ workflow รับ payload จาก event/manual/webhook/cron",
  },
  fields: [],
  run: async (_cfg, input, ctx) => {
    ctx.log(`trigger fired with keys: ${Object.keys(input.data).join(", ") || "(empty)"}`);
    return ok(input.data);
  },
};
