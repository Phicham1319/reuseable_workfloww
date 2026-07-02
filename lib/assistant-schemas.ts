import { z } from "zod";

export const PlanStepSchema = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string(),
});

export const PlanSchema = z.object({
  steps: z.array(PlanStepSchema),
  summary: z.string(),
});

export type Plan = z.infer<typeof PlanSchema>;
