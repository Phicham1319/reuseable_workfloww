import { Inngest, NonRetriableError } from "inngest";
import { prisma } from "@/lib/db";
import { runWorkflow, type StepRunner } from "@/lib/interpreter";

export const inngest = new Inngest({ id: "workflow-builder" });

// ฟังก์ชันทดสอบ: รับ event "test/hello" แล้ว log
// Inngest v4: trigger ย้ายเข้ามาใน config เป็น `triggers` (createFunction รับ 2 args)
export const hello = inngest.createFunction(
  { id: "hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.run("greet", async () => `สวัสดี ${event.data.name ?? "world"}`);
    return { ok: true };
  },
);

/**
 * workflow.run — interpreter ตัวเดียวที่ทุก trigger (UI/API/webhook/cron) มารวมกัน.
 * แต่ละ node = step.run() → ได้ durability + retry ในตัว.
 * retries: 3 → ถ้า node throw (เช่น AI output ไม่ตรง schema) จะ retry ก่อนจบเป็น failed.
 *
 * event.data: { runId?, workflowId?, graph?, payload?, trigger? }
 *  - runId มาจาก /api/run (สร้าง Run ไว้ล่วงหน้าแล้ว) → ใช้ตัวนั้นเลย
 *  - ยิง inngest.send ตรง ๆ ด้วยแค่ { graph } ก็ได้ (จะสร้าง Run/inline workflow ให้)
 */
export const workflowRun = inngest.createFunction(
  { id: "workflow-run", retries: 3, triggers: [{ event: "workflow.run" }] },
  async ({ event, step }) => {
    const {
      runId: providedRunId,
      workflowId,
      graph: inlineGraph,
      payload = {},
      trigger = "manual",
    } = (event.data ?? {}) as {
      runId?: string;
      workflowId?: string;
      graph?: unknown;
      payload?: Record<string, unknown>;
      trigger?: string;
    };

    const resolved = await step.run("resolve", async () => {
      if (workflowId) {
        const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
        if (!wf) throw new NonRetriableError(`workflow not found: ${workflowId}`);
        return { workflowId, graph: wf.graph as unknown };
      }
      if (inlineGraph) {
        // เก็บ inline graph เป็น workflow ชั่วคราวเพื่อให้ Run อ้างถึงได้
        const wf = await prisma.workflow.create({
          data: { name: "inline", graph: inlineGraph as object },
        });
        return { workflowId: wf.id, graph: inlineGraph };
      }
      throw new NonRetriableError("workflow.run requires workflowId or graph");
    });

    const runId =
      providedRunId ??
      (await step.run("create-run", async () => {
        const run = await prisma.run.create({
          data: { workflowId: resolved.workflowId, status: "running", trigger },
        });
        return run.id;
      }));

    // inngest step.run คืน Jsonify<T> (serialize) — cast กลับเป็น T
    // (ค่าที่ส่งคืนเป็น JSON อยู่แล้ว เช่น Envelope จึงปลอดภัย)
    const stepRunner: StepRunner = <T,>(id: string, fn: () => Promise<T>) =>
      step.run(id, fn) as Promise<T>;

    const result = await runWorkflow({
      graph: resolved.graph,
      runId,
      payload,
      step: stepRunner,
    });

    return { runId, ...result };
  },
);

export const functions = [hello, workflowRun];
