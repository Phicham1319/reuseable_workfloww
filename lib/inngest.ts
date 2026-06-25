import { Inngest } from "inngest";
import { prisma } from "@/lib/db";
import { GraphSchema } from "@/lib/graph";
import { runGraph } from "@/lib/interpreter";

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
 * รัน workflow (D2): event ส่ง { workflowId, payload } → โหลด graph จาก DB
 * function retries: 0 — เราคุม retry เองราย node ใน interpreter (D3)
 */
export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", retries: 0, triggers: [{ event: "workflow.run" }] },
  async ({ event, step }) => {
    const { workflowId, payload } = event.data as {
      workflowId: string;
      payload?: Record<string, unknown>;
    };

    const wf = await step.run("load-workflow", () =>
      prisma.workflow.findUniqueOrThrow({ where: { id: workflowId } }),
    );
    const graph = GraphSchema.parse(wf.graph);

    const run = await step.run("create-run", () =>
      prisma.run.create({
        data: { workflowId, status: "running", trigger: "manual" },
      }),
    );

    const result = await runGraph(graph, run.id, step, payload ?? {});

    await step.run("finalize", () =>
      prisma.run.update({
        where: { id: run.id },
        data: { status: result.status },
      }),
    );

    return { runId: run.id, status: result.status };
  },
);

export const functions = [hello, runWorkflow];