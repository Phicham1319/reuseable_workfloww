import { prisma } from "@/lib/db";

/** recent runs สำหรับหน้า History / observability */
export async function GET() {
  const runs = await prisma.run.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      trigger: true,
      startedAt: true,
      workflow: { select: { id: true, name: true } },
      _count: { select: { nodeRuns: true } },
    },
  });

  return Response.json(
    runs.map((r) => ({
      id: r.id,
      status: r.status,
      trigger: r.trigger,
      startedAt: r.startedAt,
      workflowId: r.workflow?.id ?? null,
      workflowName: r.workflow?.name ?? "—",
      nodeCount: r._count.nodeRuns,
    })),
  );
}
