import type { IconName } from "@/components/ui/icons";

/** ไอคอน + สี + หมวด สำหรับ node แต่ละชนิด (ใช้ร่วมกันทั้ง canvas และ node picker) */
export const NODE_ICON: Record<string, IconName> = {
  trigger: "Bolt",
  transform: "Wrench",
  "ai.instruct": "Sparkles",
  if: "Branch",
  "http.request": "Globe",
  "email.send": "Mail",
};

/** accent โทนพาสเทล (light) */
export const NODE_ACCENT: Record<string, string> = {
  trigger: "bg-amber-100 text-amber-600",
  transform: "bg-sky-100 text-sky-600",
  "ai.instruct": "bg-violet-100 text-violet-600",
  if: "bg-fuchsia-100 text-fuchsia-600",
  "http.request": "bg-emerald-100 text-emerald-600",
  "email.send": "bg-rose-100 text-rose-600",
};

export const NODE_CATEGORY: Record<string, string> = {
  trigger: "Triggers",
  "ai.instruct": "AI",
  transform: "Logic",
  if: "Logic",
  "http.request": "API",
  "email.send": "API",
};

export const CATEGORY_ORDER = ["Triggers", "AI", "Logic", "API", "Other"];

export const nodeIconName = (type: string): IconName => NODE_ICON[type] ?? "Dot";

/** ภาพประกอบสไตล์ line-art น่ารัก (อยู่ใน /public/nodes) */
export const NODE_IMAGE: Record<string, string> = {
  trigger: "/nodes/node-trigger.png",
  transform: "/nodes/node-transform.png",
  "ai.instruct": "/nodes/node-ai.png",
  if: "/nodes/node-if.png",
  "http.request": "/nodes/node-http.png",
  "email.send": "/nodes/node-email.png",
};

export const nodeImage = (type: string) => NODE_IMAGE[type] ?? "";
export const nodeAccent = (type: string) => NODE_ACCENT[type] ?? "bg-surface-muted text-muted";
export const nodeCategory = (type: string) => NODE_CATEGORY[type] ?? "Other";
