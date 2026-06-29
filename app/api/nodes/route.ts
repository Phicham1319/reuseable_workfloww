import { nodeMetas } from "@/lib/nodes/registry";

/** GET /api/nodes — metadata ของ node ทั้งหมดสำหรับ palette + config form */
export async function GET() {
  return Response.json(nodeMetas());
}
