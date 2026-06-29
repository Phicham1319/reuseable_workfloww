import { z } from "zod";
import { ok, type NodeDef } from "@/lib/graph";

/**
 * email.send — ส่งอีเมลผ่าน Resend (HTTP API, ไม่ต้องลง SDK)
 * key อยู่ใน env: RESEND_API_KEY (+ EMAIL_FROM optional)
 * ⚠️ at-least-once: ถ้าส่งสำเร็จแล้ว throw หลังจากนั้น retry อาจส่งซ้ำ (ยอมใน v1)
 */
export const emailSend: NodeDef = {
  schema: z.object({
    to: z.string(),
    subject: z.string(),
    body: z.string(),
    from: z.string().optional(),
  }),
  meta: { label: "Send Email", description: "ส่งอีเมล (ผ่าน Resend)" },
  retries: 1, // กันส่งซ้ำเยอะ
  outputFields: () => ["sent", "id"],
  run: async (cfg) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.from ?? process.env.EMAIL_FROM ?? "onboarding@resend.dev",
        to: cfg.to,
        subject: cfg.subject,
        text: cfg.body,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
    return ok({ sent: true, id: (data as { id?: string }).id });
  },
};
