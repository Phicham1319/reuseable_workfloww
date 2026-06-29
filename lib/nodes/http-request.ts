import { z } from "zod";
import { ok, fail } from "@/lib/graph";
import { coerceSchema } from "@/lib/json-schema";
import type { UiNodeDef } from "./types";

const schema = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
  headers: z.any().optional(),
  body: z.string().optional(),
  timeoutMs: z.coerce.number().default(10000),
});

/**
 * http.request — fetch พร้อม timeout (AbortController).
 * คืน { status, ok, body } โดย body parse เป็น JSON ถ้าได้
 */
export const httpRequestNode: UiNodeDef = {
  schema,
  meta: {
    label: "HTTP Request",
    description: "ยิง HTTP request (fetch) พร้อม timeout แล้วคืน status/body",
  },
  fields: [
    { name: "url", label: "URL", kind: "text", required: true, placeholder: "https://api.example.com/data" },
    { name: "method", label: "Method", kind: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    { name: "headers", label: "Headers (JSON)", kind: "json", placeholder: '{ "Authorization": "Bearer ..." }' },
    { name: "body", label: "Body", kind: "textarea", placeholder: '{ "key": "value" }' },
    { name: "timeoutMs", label: "Timeout (ms)", kind: "number", placeholder: "10000" },
  ],
  run: async (cfg, _input, ctx) => {
    const { url, method, headers, body, timeoutMs } = schema.parse(cfg);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    ctx.log(`http ${method} ${url}`);
    try {
      const res = await fetch(url, {
        method,
        headers: (coerceSchema(headers) as Record<string, string>) ?? undefined,
        body: method === "GET" || method === "DELETE" ? undefined : body,
        signal: controller.signal,
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        /* keep text */
      }
      return ok({ status: res.status, ok: res.ok, body: parsed });
    } catch (e) {
      const msg = e instanceof Error && e.name === "AbortError" ? `timeout after ${timeoutMs}ms` : String(e);
      return fail(msg);
    } finally {
      clearTimeout(timer);
    }
  },
};
