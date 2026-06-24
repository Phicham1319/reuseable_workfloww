import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

// Day 1 smoke test: ยิง event hello-world ออกไปให้ Inngest
export async function POST() {
  const { ids } = await inngest.send({
    name: "test/hello",
    data: { name: "Cleverse" },
  });
  return NextResponse.json({ sent: true, ids });
}
