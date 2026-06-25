import { z } from "zod";
import { ok, type NodeDef } from "@/lib/graph";

/** จุดเริ่ม workflow — ส่ง payload ที่เข้ามาต่อไปยัง node ถัดไป */
export const trigger: NodeDef = {
  schema: z.object({}),
  meta: { label: "Trigger", description: "จุดเริ่ม workflow รับ payload เข้ามา" },
  retries: 0,
  run: async (_cfg, input) => ok(input.data),
};
