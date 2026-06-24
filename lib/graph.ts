import { z } from "zod";

/**
 * CONTRACT ร่วมระหว่างทีม A (engine) กับทีม B (canvas).
 * ตกลง Day 1 — ห้ามเปลี่ยน shape โดยพลการ. แก้เมื่อไหร่ต้องคุยกันก่อน.
 */

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(), // key ใน registry
  config: z.record(z.string(), z.any()),
  onError: z.enum(["stop", "continue", "route"]).default("stop"),
  next: z.array(z.string()).default([]),
  position: z.object({ x: z.number(), y: z.number() }), // ให้ canvas ใช้
});
export type Node = z.infer<typeof NodeSchema>;

export const EdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
});
export type Edge = z.infer<typeof EdgeSchema>;

export const GraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});
export type Graph = z.infer<typeof GraphSchema>;

/**
 * Envelope = ก้อนข้อมูลที่ไหลระหว่าง node.
 * output ของ node หนึ่ง = input ของ node ถัดไป.
 */
export const EnvelopeSchema = z.object({
  status: z.enum(["success", "failed", "skipped"]),
  data: z.record(z.string(), z.any()),
  error: z.string().nullable(),
});
export type Envelope = z.infer<typeof EnvelopeSchema>;

/** context ที่ interpreter ส่งให้ node ตอนรัน */
export type Ctx = {
  runId: string;
  nodeId: string;
  /** logger เบา ๆ; จะต่อ NodeRun ทีหลัง */
  log: (msg: string) => void;
};

/**
 * Node registry entry.
 * - schema: zod schema ของ config (ให้ canvas gen ฟอร์ม)
 * - run: ตรรกะของ node
 * - meta: ป้อนให้ AI helper + palette
 */
export type NodeDef = {
  schema: z.ZodTypeAny;
  run: (cfg: any, input: Envelope, ctx: Ctx) => Promise<Envelope>;
  meta: { label: string; description: string };
};

/** helper สร้าง Envelope สั้น ๆ */
export const ok = (data: Record<string, unknown> = {}): Envelope => ({
  status: "success",
  data,
  error: null,
});
export const fail = (
  error: string,
  data: Record<string, unknown> = {},
): Envelope => ({
  status: "failed",
  data,
  error,
});
export const skip = (data: Record<string, unknown> = {}): Envelope => ({
  status: "skipped",
  data,
  error: null,
});
