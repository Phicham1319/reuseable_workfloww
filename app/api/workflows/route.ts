import { prisma } from "@/lib/db";
import { GraphSchema } from "@/lib/graph";

export async function POST(req: Request) {
  const { id, name, graph } = await req.json();
  GraphSchema.parse(graph);

  // มี id → update (save ทับ workflow เดิม), ไม่มี → create ใหม่
  const wf = id
    ? await prisma.workflow.update({ where: { id }, data: { name, graph } })
    : await prisma.workflow.create({ data: { name, graph } });

  return Response.json({ id: wf.id });
}

export async function GET() {
  const workflows = await prisma.workflow.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true },
  });
  return Response.json(workflows);
}
