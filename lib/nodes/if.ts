import { z } from "zod";
import { ok } from "@/lib/graph";
import type { UiNodeDef } from "./types";

const OPERATORS = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "truthy",
  "exists",
] as const;

const schema = z.object({
  field: z.string().min(1),
  operator: z.enum(OPERATORS).default("eq"),
  value: z.string().optional(),
});

function getField(data: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], data);
}

function compare(actual: unknown, operator: string, expected?: string): boolean {
  switch (operator) {
    case "truthy":
      return Boolean(actual);
    case "exists":
      return actual !== undefined && actual !== null;
    case "contains":
      return String(actual ?? "").includes(expected ?? "");
    case "eq":
      return String(actual) === String(expected);
    case "neq":
      return String(actual) !== String(expected);
    case "gt":
      return Number(actual) > Number(expected);
    case "gte":
      return Number(actual) >= Number(expected);
    case "lt":
      return Number(actual) < Number(expected);
    case "lte":
      return Number(actual) <= Number(expected);
    default:
      return false;
  }
}

/**
 * if — เทียบค่า input.data.<field> กับ value ตาม operator
 * แล้วเลือกทางเดินผ่าน edge label "true"/"false".
 * (interpreter อ่าน data.__branch เพื่อเลือก edge)
 */
export const ifNode: UiNodeDef = {
  schema,
  meta: {
    label: "If / Branch",
    description: "เทียบเงื่อนไขบน input.data แล้วแตกทางไป edge label true/false",
  },
  fields: [
    { name: "field", label: "Field path", kind: "text", required: true, placeholder: "decision" },
    {
      name: "operator",
      label: "Operator",
      kind: "select",
      options: [...OPERATORS],
      required: true,
    },
    { name: "value", label: "Value", kind: "text", placeholder: "approve" },
  ],
  run: async (cfg, input, ctx) => {
    const { field, operator, value } = schema.parse(cfg);
    const actual = getField(input.data, field);
    const result = compare(actual, operator, value);
    ctx.log(`if: ${field} (${JSON.stringify(actual)}) ${operator} ${value ?? ""} → ${result}`);
    return ok({ ...input.data, __branch: result ? "true" : "false" });
  },
};
