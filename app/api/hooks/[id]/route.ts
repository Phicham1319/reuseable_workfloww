import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

/**
 * Webhook trigger — ระบบภายนอก POST payload มาที่ /api/hooks/<workflowId>
 * → ยิง event workflow.run ให้ engine รัน workflow นั้น
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Next 15+: params เป็น Promise
  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    /* ไม่มี body / ไม่ใช่ JSON → payload ว่าง */
  }

  await inngest.send({
    name: "workflow.run",
    data: { workflowId: id, trigger: "webhook", payload },
  });

  return NextResponse.json({ ok: true });
}
