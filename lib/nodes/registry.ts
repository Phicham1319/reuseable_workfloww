import { triggerNode } from "./trigger";
import { transformNode } from "./transform";
import { aiInstructNode } from "./ai-instruct";
import { ifNode } from "./if";
import { httpRequestNode } from "./http-request";
import { emailSendNode } from "./email-send";
import type { UiNodeDef, NodeMeta } from "./types";

/**
 * Node registry — key = node.type ใน graph.
 * เพิ่ม node ใหม่ = เพิ่ม 1 entry ตรงนี้ (ไม่ต้องแตะ interpreter).
 */
export const registry: Record<string, UiNodeDef> = {
  trigger: triggerNode,
  transform: transformNode,
  "ai.instruct": aiInstructNode,
  if: ifNode,
  "http.request": httpRequestNode,
  "email.send": emailSendNode,
};

export type NodeType = keyof typeof registry;

/** metadata ที่ serialize ส่งให้ client ได้ (palette + config form) */
export function nodeMetas(): NodeMeta[] {
  return Object.entries(registry).map(([type, def]) => ({
    type,
    label: def.meta.label,
    description: def.meta.description,
    fields: def.fields,
  }));
}
