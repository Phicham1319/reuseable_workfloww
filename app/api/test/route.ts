import { prisma } from "@/lib/db";
import { GraphSchema } from "@/lib/graph";
import { runWorkflow, directRunner } from "@/lib/interpreter";
import { pruneOldRuns } from "@/lib/runs";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    workflowId,
    startNodeId,
    stopNodeId,
    payload = {},
    sampleInput,
  } = body as {
    workflowId: string;
    startNodeId?: string;
    stopNodeId?: string;
    payload?: Record<string, unknown>;
    sampleInput?: Record<string, unknown>;
  };

  if (!workflowId) {
    return new Response("workflowId required", { status: 400 });
  }

  const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!wf) return new Response("workflow not found", { status: 404 });

  GraphSchema.parse(wf.graph);
  await pruneOldRuns(workflowId);

  const run = await prisma.run.create({
    data: { workflowId, status: "running", trigger: "test" },
  });

  const testPayload = sampleInput ?? payload;

  try {
    const result = await runWorkflow({
      graph: wf.graph,
      runId: run.id,
      payload: testPayload,
      step: directRunner,
      startNodeId,
      stopNodeId: stopNodeId ?? startNodeId,
    });
    return Response.json({ runId: run.id, ...result });
  } catch (e) {
    await prisma.run.update({ where: { id: run.id }, data: { status: "failed" } });
    return new Response(String(e), { status: 500 });
  }
}
