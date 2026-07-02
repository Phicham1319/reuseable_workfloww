import { prisma } from "@/lib/db";

const MAX_RUNS_PER_WORKFLOW = 20;

export function capJson(v: unknown, maxBytes = 48_000): unknown {
  const s = JSON.stringify(v);
  if (s.length <= maxBytes) return v;
  return { __truncated: true, preview: s.slice(0, 500) + "…" };
}

/** ลบ run เก่าเกินเพดาน + test run เก็บแค่ล่าสุด 1 */
export async function pruneOldRuns(workflowId: string): Promise<void> {
  const testRuns = await prisma.run.findMany({
    where: { workflowId, trigger: "test" },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  if (testRuns.length > 1) {
    await prisma.run.deleteMany({
      where: { id: { in: testRuns.slice(1).map((r) => r.id) } },
    });
  }

  const runs = await prisma.run.findMany({
    where: { workflowId },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  if (runs.length > MAX_RUNS_PER_WORKFLOW) {
    await prisma.run.deleteMany({
      where: { id: { in: runs.slice(MAX_RUNS_PER_WORKFLOW).map((r) => r.id) } },
    });
  }
}
