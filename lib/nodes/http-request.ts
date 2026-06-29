import { z } from "zod";
import { ok, type NodeDef } from "@/lib/graph";

/**
 * http.request — ยิง HTTP request ไปยัง URL ภายนอก (fetch + timeout)
 * - ไม่ ok (status ไม่ 2xx) หรือ timeout/network → throw → Inngest retry
 * - คืน { status, ok, body } (body parse เป็น JSON ถ้าทำได้ ไม่งั้นเป็น text)
 */
export const httpRequest: NodeDef = {
  schema: z.object({
    url: z.string(),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.any().optional(),
    timeoutMs: z.coerce.number().default(10000), // form ส่ง string → coerce
  }),
  meta: { label: "HTTP Request", description: "ยิง HTTP request ไปยัง URL ภายนอก" },
  retries: 2, // network สะดุดชั่วคราว → retry ช่วย
  outputFields: () => ["status", "ok", "body"],
  run: async (cfg, _input, ctx) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs ?? 10000);
    const method = cfg.method ?? "GET";
    ctx.log(`http ${method} ${cfg.url}`);
    try {
      const res = await fetch(cfg.url, {
        method,
        headers: { "content-type": "application/json", ...(cfg.headers ?? {}) },
        body:
          method !== "GET" && method !== "DELETE" && cfg.body !== undefined
            ? typeof cfg.body === "string"
              ? cfg.body
              : JSON.stringify(cfg.body)
            : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* ไม่ใช่ JSON → เก็บเป็น text */
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      return ok({ status: res.status, ok: res.ok, body });
    } finally {
      clearTimeout(timer);
    }
  },
};