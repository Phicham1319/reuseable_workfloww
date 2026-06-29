import { z } from "zod";
import { ok, type NodeDef } from "@/lib/graph";

/**
 * แปลงข้อมูลด้วย JS expression สั้น ๆ บน input.data
 * เช่น expression = "{ name: data.firstName, n: data.score + 1 }"
 * expression เข้าถึง `data` (=input.data) และ `input` (envelope เต็ม)
 *
 * TODO(security): raw new Function — ยอมรับใน v1 เพราะ expression เขียนโดย
 * author ที่เชื่อถือได้ (build-time) + ไม่มี multi-tenant + Day 7 มี auth กั้น author.
 * payload ภายนอกเข้ามาเป็น "data" (ข้อมูล) ไม่ถูก execute เป็นโค้ด.
 * harden ทีหลังด้วย worker thread + timeout / isolated-vm (กัน sync infinite loop + globals).
 */
export const transform: NodeDef = {
  schema: z.object({ expression: z.string() }),
  meta: { label: "Transform", description: "แปลงข้อมูลด้วย JS expression บน data" },
  retries: 0, // deterministic — retry ไม่ช่วย
  outputFields: () => [], // JS expression — เดาไม่ได้
  run: async (cfg, input, ctx) => {
    ctx.log(`transform: ${cfg.expression}`);
    const fn = new Function("data", "input", `"use strict"; return (${cfg.expression});`);
    const result = fn(input.data, input);
    return ok(
      result && typeof result === "object" && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : { value: result },
    );
  },
};