import { z } from "zod";

/**
 * แปลง "schema แบบ JSON" (เก็บใน node.config) ให้เป็น Zod schema
 * เพื่อส่งเข้า generateObject ของ AI SDK.
 *
 * รองรับ 2 รูปแบบเพื่อให้กรอกง่ายใน config form:
 *  1) shorthand: { decision: "string", score: "number", ok: "boolean" }
 *  2) JSON-Schema ย่อ: { type:"object", properties:{...}, required:[...] }
 *
 * ใน shorthand ค่าของ field เป็นได้ทั้ง string ("string"|"number"|...)
 * หรือ object { type, enum?, items?, description?, optional? }
 */

type FieldDef =
  | string
  | {
      type?: string;
      enum?: string[];
      items?: FieldDef;
      description?: string;
      optional?: boolean;
      properties?: Record<string, FieldDef>;
      required?: string[];
    };

function leaf(type: string | undefined, def: Exclude<FieldDef, string>): z.ZodTypeAny {
  if (def.enum && def.enum.length > 0) {
    return z.enum(def.enum as [string, ...string[]]);
  }
  switch ((type ?? "string").toLowerCase()) {
    case "number":
    case "integer":
      return z.number();
    case "boolean":
    case "bool":
      return z.boolean();
    case "array": {
      const inner = def.items ? fieldToZod(def.items) : z.any();
      return z.array(inner);
    }
    case "object":
      return objectToZod(def.properties ?? {}, def.required ?? []);
    case "any":
      return z.any();
    case "string":
    default:
      return z.string();
  }
}

function fieldToZod(field: FieldDef): z.ZodTypeAny {
  if (typeof field === "string") return leaf(field, {});
  let zt = leaf(field.type, field);
  if (field.description) zt = zt.describe(field.description);
  if (field.optional) zt = zt.optional();
  return zt;
}

function objectToZod(
  properties: Record<string, FieldDef>,
  required: string[],
): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};
  const requiredSet = new Set(required);
  for (const [key, field] of Object.entries(properties)) {
    let zt = fieldToZod(field);
    // ถ้าไม่ได้อยู่ใน required และยังไม่ optional ให้ทำเป็น optional
    const explicitlyOptional = typeof field === "object" && field.optional;
    if (!requiredSet.has(key) && !explicitlyOptional && required.length > 0) {
      zt = zt.optional();
    }
    shape[key] = zt;
  }
  return z.object(shape);
}

export function zodFromJson(schema: unknown): z.ZodTypeAny {
  if (!schema || typeof schema !== "object") {
    // ไม่มี schema → ยอมรับ object อะไรก็ได้
    return z.record(z.string(), z.any());
  }

  // ถ้าเป็น string เดียว (เช่นเก็บ JSON ไว้เป็น text) ลอง parse
  const obj = schema as Record<string, unknown>;

  // รูปแบบ JSON-Schema ย่อ
  if (obj.type === "object" && obj.properties) {
    return objectToZod(
      obj.properties as Record<string, FieldDef>,
      (obj.required as string[]) ?? [],
    );
  }

  // shorthand: ทุก key คือ field
  return objectToZod(obj as Record<string, FieldDef>, Object.keys(obj));
}

/** parse string เป็น object ถ้าจำเป็น (config form เก็บ schema เป็น JSON text) */
export function coerceSchema(value: unknown): unknown {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }
  return value;
}
