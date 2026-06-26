/**
 * Inline templating engine (B-lite) — แทน `{{path}}` ในทุก config string ก่อนเรียก node.run
 *
 * 2 รูปแบบอ้างอิง:
 *   {{nodeId.field}} → ผลของ node นั้นใน steps map (เจาะจง — เหมือน Zapier)
 *   {{field}}        → ผลของ node ก่อนหน้า (shorthand) จาก data
 * กฎเลือก: ถ้า segment แรกตรงกับชื่อ node ใน steps → ใช้ steps · ไม่งั้น → data
 *
 * 2 โหมดแทนค่า:
 *   ทั้งช่อง = {{...}} ตัวเดียว → คืนค่าดิบ คงชนิด (number/object)
 *   ปนข้อความ              → interpolate เป็น string
 *
 * scope = ผล node ที่รันแล้วเท่านั้น (ไม่เปิดถึง env/secret) · อ่านอย่างเดียว ไม่ eval · perf ~0
 * path ไม่เจอ → ค่าว่าง + เก็บใน missing (interpreter เอาไป warn)
 */

const TEMPLATE_RE = /\{\{\s*([^}]+?)\s*\}\}/g;
const WHOLE_RE = /^\{\{\s*([^}]+?)\s*\}\}$/;

/** ผลของทุก node ที่รันแล้ว + ผล node ก่อนหน้า (shorthand) */
export type TemplateCtx = {
  steps: Record<string, unknown>; // { [nodeId]: output.data }
  data: unknown; // ผล node ก่อนหน้า (สำหรับ {{field}})
};

/** อ่านค่าตาม path เช่น "user.email", "items.0.name", "items[0].name" */
export function getPath(data: unknown, path: string): { found: boolean; value: unknown } {
  const keys = path
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  let acc: unknown = data;
  for (const key of keys) {
    if (acc != null && typeof acc === "object" && key in (acc as object)) {
      acc = (acc as Record<string, unknown>)[key];
    } else {
      return { found: false, value: undefined };
    }
  }
  return { found: true, value: acc };
}

/** เลือกว่า {{expr}} อ้างจาก steps (nodeId.field) หรือ data (shorthand) */
function lookup(expr: string, ctx: TemplateCtx): { found: boolean; value: unknown } {
  const e = expr.trim();
  const dot = e.indexOf(".");
  if (dot > 0) {
    const head = e.slice(0, dot);
    if (Object.prototype.hasOwnProperty.call(ctx.steps, head)) {
      return getPath(ctx.steps[head], e.slice(dot + 1)); // {{nodeId.field}}
    }
  }
  return getPath(ctx.data, e); // {{field}} shorthand → ผล node ก่อนหน้า
}

function toStr(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function resolveString(str: string, ctx: TemplateCtx, missing: string[]): unknown {
  const whole = str.match(WHOLE_RE);
  if (whole) {
    const path = whole[1].trim();
    const { found, value } = lookup(path, ctx);
    if (!found) {
      missing.push(path);
      return "";
    }
    return value; // ค่าดิบ คงชนิด
  }
  if (!str.includes("{{")) return str;
  return str.replace(TEMPLATE_RE, (_m, rawPath: string) => {
    const path = rawPath.trim();
    const { found, value } = lookup(path, ctx);
    if (!found) {
      missing.push(path);
      return "";
    }
    return toStr(value);
  });
}

function walk(node: unknown, ctx: TemplateCtx, missing: string[]): unknown {
  if (typeof node === "string") return resolveString(node, ctx, missing);
  if (Array.isArray(node)) return node.map((v) => walk(v, ctx, missing));
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = walk(v, ctx, missing);
    }
    return out;
  }
  return node;
}

/**
 * resolveConfig — แทน {{path}} ทุกที่ใน config
 * คืน config ใหม่ (ไม่ mutate) + รายการ path ที่หาไม่เจอ
 */
export function resolveConfig<T>(config: T, ctx: TemplateCtx): { config: T; missing: string[] } {
  const missing: string[] = [];
  const resolved = walk(config, ctx, missing) as T;
  return { config: resolved, missing };
}
