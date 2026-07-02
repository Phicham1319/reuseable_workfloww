import { prisma } from "@/lib/db";
import { pruneOldRuns } from "@/lib/runs";
import { inngest } from "@/lib/inngest";
import { GraphSchema } from "@/lib/graph";

export async function POST(req: Request) {
  const { workflowId: wfIdInput, graph, payload = {} } = await req.json();

  let workflowId: string | undefined = wfIdInput;

  if (!workflowId) {
    if (!graph) {
      return new Response("ต้องมี workflowId หรือ graph", { status: 400 });
    }
    GraphSchema.parse(graph);
    const wf = await prisma.workflow.create({ data: { name: "inline", graph } });
    workflowId = wf.id;
  }

  await pruneOldRuns(workflowId);

  const run = await prisma.run.create({
    data: { workflowId, status: "queued", trigger: "manual" },
  });

  await inngest.send({
    name: "workflow.run",
    data: { runId: run.id, workflowId, payload, trigger: "manual" },
  });

  return Response.json({ runId: run.id, workflowId });
}
