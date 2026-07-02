import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const run = await prisma.run.findFirst({
    where: { workflowId: id },
    orderBy: { startedAt: "desc" },
    include: {
      nodeRuns: {
        select: {
          nodeId: true,
          input: true,
          output: true,
          error: true,
          status: true,
        },
      },
    },
  });

  if (!run) return Response.json(null);

  return Response.json({
    runId: run.id,
    status: run.status,
    trigger: run.trigger,
    nodeRuns: run.nodeRuns,
  });
}
