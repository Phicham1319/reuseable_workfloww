/**
 * Inline templating — แทน {{path}} ในทุก config string ก่อนเรียก node.run
 *
 * {{nodeId.field}} → ผลของ node นั้นใน steps map
 * {{field}}        → ผลของ node ก่อนหน้า (shorthand)
 */

const TEMPLATE_RE = /\{\{\s*([^}]+?)\s*\}\}/g;
const WHOLE_RE = /^\{\{\s*([^}]+?)\s*\}\}$/;

export type TemplateCtx = {
  steps: Record<string, unknown>;
  data: unknown;
};

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

function lookup(expr: string, ctx: TemplateCtx): { found: boolean; value: unknown } {
  const e = expr.trim();
  const dot = e.indexOf(".");
  if (dot > 0) {
    const head = e.slice(0, dot);
    if (Object.prototype.hasOwnProperty.call(ctx.steps, head)) {
      return getPath(ctx.steps[head], e.slice(dot + 1));
    }
  }
  return getPath(ctx.data, e);
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
    return value;
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

export function resolveConfig<T>(config: T, ctx: TemplateCtx): { config: T; missing: string[] } {
  const missing: string[] = [];
  const resolved = walk(config, ctx, missing) as T;
  return { config: resolved, missing };
}
