import { z } from "zod";
import { ok, fail } from "@/lib/graph";
import type { UiNodeDef } from "./types";

const schema = z.object({
  to: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().default(""),
  from: z.string().default("onboarding@resend.dev"),
});

/**
 * email.send — ส่งอีเมลผ่าน Resend (REST API).
 * ถ้าไม่มี RESEND_API_KEY จะ mock (log อย่างเดียว) เพื่อให้ dev รันได้
 */
export const emailSendNode: UiNodeDef = {
  schema,
  meta: {
    label: "Send Email",
    description: "ส่งอีเมลผ่าน Resend (mock เมื่อไม่มี RESEND_API_KEY)",
  },
  fields: [
    { name: "to", label: "To", kind: "text", required: true, placeholder: "user@example.com" },
    { name: "from", label: "From", kind: "text", placeholder: "onboarding@resend.dev" },
    { name: "subject", label: "Subject", kind: "text", required: true },
    { name: "body", label: "Body (HTML/text)", kind: "textarea" },
  ],
  run: async (cfg, _input, ctx) => {
    const { to, subject, body, from } = schema.parse(cfg);
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      ctx.log(`[mock email] to=${to} subject="${subject}"`);
      return ok({ mocked: true, to, subject });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html: body }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return fail(`resend ${res.status}: ${errText}`);
    }
    const json = (await res.json()) as { id?: string };
    ctx.log(`email sent id=${json.id}`);
    return ok({ id: json.id, to, subject });
  },
};
