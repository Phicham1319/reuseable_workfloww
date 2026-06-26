import type { NodeDef } from "@/lib/graph";
import { trigger } from "./trigger";
import { transform } from "./transform";
import { aiInstruct } from "./ai-instruct";

/**
 * สมุดรายชื่อ node — key ต้องตรงกับ node.type ใน graph
 * เพิ่ม node ใหม่ = เพิ่ม 1 entry ที่นี่ (ไม่ต้องแตะ interpreter)
 */
export const registry: Record<string, NodeDef> = {
  trigger,
  transform,
  "ai.instruct": aiInstruct,
};
