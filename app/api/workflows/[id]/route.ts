import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const wf = await prisma.workflow.findUnique({ where: { id } });
  if (!wf) return new Response("not found", { status: 404 });
  return Response.json(wf);
}
