import { Inngest } from "inngest";
export const inngest = new Inngest({ id: "workflow-builder" });

// ฟังก์ชันทดสอบ: รับ event "test/hello" แล้ว log
// Inngest v4: trigger ย้ายเข้ามาใน config เป็น `triggers` (createFunction รับ 2 args)
export const hello = inngest.createFunction(
  { id: "hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.run("greet", async () => `สวัสดี ${event.data.name ?? "world"}`);
    return { ok: true };
  },
);

export const functions = [hello];