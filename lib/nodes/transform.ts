import { z } from "zod";
import { ok } from "@/lib/graph";
import type { UiNodeDef } from "./types";

/**
 * transform — eval JS expression บน input.data.
 * ใช้ new Function (sandbox ทีหลังตามแผน Day 7).
 * expression เข้าถึงตัวแปร `data` (=input.data) และ `input` (envelope เต็ม).
 * ผลลัพธ์: ถ้าเป็น object → ใช้เป็น data ตรง ๆ, ถ้าไม่ใช่ → ห่อเป็น { value }
 */
const schema = z.object({
  expression: z.string().min(1),
});

export const transformNode: UiNodeDef = {
  schema,
  meta: {
    label: "Transform",
    description: "แปลงข้อมูลด้วย JS expression บน input.data (เช่น { name: data.first + ' ' + data.last })",
  },
  fields: [
    {
      name: "expression",
      label: "Expression",
      kind: "textarea",
      required: true,
      placeholder: "{ fullName: data.first + ' ' + data.last }",
      help: "JS expression — ใช้ `data` (input.data) และ `input` ได้",
    },
  ],
  run: async (cfg, input, ctx) => {
    const { expression } = schema.parse(cfg);
    ctx.log(`transform: ${expression}`);
    const fn = new Function("data", "input", `"use strict"; return (${expression});`);
    const result = fn(input.data, input);
    const data =
      result && typeof result === "object" && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : { value: result };
    return ok(data);
  },
};
