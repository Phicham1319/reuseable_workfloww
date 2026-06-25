import { PrismaClient } from "@prisma/client";
import { GraphSchema } from "@/lib/graph";
const db = new PrismaClient();

export async function POST(req: Request) {
  const { name, graph } = await req.json();
  GraphSchema.parse(graph);
  const wf = await db.workflow.create({ data: { name, graph } });
  return Response.json({ id: wf.id });
}

export async function GET() {
  return Response.json(await db.workflow.findMany());
}