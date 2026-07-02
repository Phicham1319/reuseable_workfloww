import { generateObject } from "ai";
import { z } from "zod";
import { openai, DEFAULT_MODEL } from "@/lib/ai";
import { PlanSchema } from "@/lib/assistant-schemas";
import { GraphSchema } from "@/lib/graph";
import { nodeMetas } from "@/lib/nodes/registry";

const ALLOWED_TYPES = nodeMetas().map((m) => m.type);

/** loose graph schema สำหรับให้ LLM คืน (มี default เพื่อกัน field ตกหล่น) */
const GraphGenSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      config: z.record(z.string(), z.any()).default({}),
      onError: z.enum(["stop", "continue", "route"]).default("stop"),
      next: z.array(z.string()).default([]),
      position: z.object({ x: z.number(), y: z.number() }),
    }),
  ),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
    }),
  ),
});

function buildCatalog() {
  return nodeMetas()
    .map((m) => {
      const fields = m.fields
        .map((f) => `${f.name}${f.required ? "*" : ""}:${f.kind}`)
        .join(", ");
      return `- ${m.type}: ${m.label} — ${m.description}${fields ? ` [config: ${fields}]` : ""}`;
    })
    .join("\n");
}

function validateTypes(graph: z.infer<typeof GraphSchema>): string | null {
  for (const node of graph.nodes) {
    if (!ALLOWED_TYPES.includes(node.type)) return `invalid node type: ${node.type}`;
  }
  return null;
}

type SelectedNode = { id: string; type: string; label?: string; config?: unknown } | null;

export async function POST(req: Request) {
  const body = await req.json();
  const { mode, message, plan, currentGraph, selectedNode } = body as {
    mode: "plan" | "generate" | "build" | "assist";
    message: string;
    plan?: z.infer<typeof PlanSchema>;
    currentGraph?: unknown;
    selectedNode?: SelectedNode;
  };

  if (!message?.trim()) {
    return Response.json({ error: "message required" }, { status: 400 });
  }

  const catalog = buildCatalog();
  const typesList = ALLOWED_TYPES.join(", ");

  if (mode === "plan") {
    try {
      const { object } = await generateObject({
        model: openai(DEFAULT_MODEL),
        schema: PlanSchema,
        prompt: `You are a workflow planning assistant. The user wants to automate a task.

Available node types (use ONLY these):
${catalog}

Allowed type keys: ${typesList}

User request: ${message}

Create a step-by-step plan using only the available node types. Each step should have type (exact key), label, and description.`,
      });
      return Response.json({ plan: object });
    } catch (e) {
      return Response.json({ error: String(e) }, { status: 500 });
    }
  }

  if (mode === "generate") {
    const planHint = plan
      ? `\nApproved plan:\n${plan.steps.map((s, i) => `${i + 1}. ${s.label} (${s.type}): ${s.description}`).join("\n")}`
      : "";

    try {
      const { object } = await generateObject({
        model: openai(DEFAULT_MODEL),
        schema: GraphGenSchema,
        prompt: `Generate a valid workflow graph JSON for this automation task.

Available node types (use ONLY these):
${catalog}

Allowed type keys: ${typesList}

User request: ${message}${planHint}

Rules:
- Start with a trigger node (type "trigger")
- Use unique node ids like n1, n2, n3
- Position nodes in a grid: x = 80 + (index % 3) * 240, y = 60 + floor(index / 3) * 130
- Connect nodes with edges (from/to matching node ids)
- For if nodes, use edge labels "true" and "false"
- Keep configs minimal but valid
- onError defaults to "stop"`,
      });

      const parsed = GraphSchema.parse(object);
      const typeErr = validateTypes(parsed);
      if (typeErr) return Response.json({ error: typeErr }, { status: 400 });
      return Response.json({ graph: parsed });
    } catch (e) {
      return Response.json({ error: String(e) }, { status: 400 });
    }
  }

  // build = สร้าง/แก้ workflow ทั้งกราฟในคำสั่งเดียว (ใช้ใน AI Helper บน canvas)
  if (mode === "build") {
    const existing = GraphSchema.safeParse(currentGraph);
    const hasExisting = existing.success && existing.data.nodes.length > 0;

    const context = hasExisting
      ? `Current workflow (MODIFY this to satisfy the request — keep existing node ids and positions where it still makes sense, add/remove/rewire as needed):
${JSON.stringify(existing.data)}`
      : `There is no existing workflow yet — build one from scratch.`;

    try {
      const { object } = await generateObject({
        model: openai(DEFAULT_MODEL),
        schema: z.object({
          summary: z.string(),
          graph: GraphGenSchema,
        }),
        prompt: `You are an AI workflow builder. Produce the COMPLETE workflow graph (full replacement, not a diff) plus a short summary.

Available node types (use ONLY these):
${catalog}

Allowed type keys: ${typesList}

${context}

User request: ${message}

Rules:
- Return the ENTIRE graph (all nodes and edges), never a partial diff.
- Start the flow with a trigger node (type "trigger") unless one already exists.
- Node ids: reuse existing ones when editing; new nodes get ids like n1, n2, n3 (unique).
- Positions: keep existing node positions; place NEW nodes in a left-to-right grid (x = 80 + col*240, y = 60 + row*130) so they don't overlap.
- Connect nodes with edges (from/to matching node ids). For "if" nodes, label the two outgoing edges "true" and "false".
- Fill node.config with sensible values based on the request; keep it minimal but valid.
- summary: 1-2 short sentences in Thai describing what you built or changed.`,
      });

      const parsed = GraphSchema.parse(object.graph);
      const typeErr = validateTypes(parsed);
      if (typeErr) return Response.json({ error: typeErr }, { status: 400 });
      return Response.json({ graph: parsed, summary: object.summary });
    } catch (e) {
      return Response.json({ error: String(e) }, { status: 400 });
    }
  }

  // assist = copilot แบบ context-aware: ตัดสินใจเองว่าจะ "แก้กราฟ" หรือ "ตอบคำถาม"
  if (mode === "assist") {
    const existing = GraphSchema.safeParse(currentGraph);
    const hasExisting = existing.success && existing.data.nodes.length > 0;

    const ctx = [
      hasExisting
        ? `Current workflow graph:\n${JSON.stringify(existing.data)}`
        : `The canvas is empty (no nodes yet).`,
      selectedNode
        ? `The user currently has this node SELECTED — treat "this node / this / it" as referring to it:\n${JSON.stringify(selectedNode)}`
        : `No node is selected.`,
    ].join("\n\n");

    try {
      const { object } = await generateObject({
        model: openai(DEFAULT_MODEL),
        schema: z.object({
          action: z.enum(["edit", "answer"]),
          message: z.string(),
          graph: GraphGenSchema.nullable(),
        }),
        prompt: `You are an AI copilot embedded in a workflow builder. You understand the current canvas and the selected node, and you help the user build, edit, explain, optimize, and debug workflows.

Available node types (use ONLY these):
${catalog}

Allowed type keys: ${typesList}

${ctx}

User: ${message}

Decide the action:
- "edit": the user wants to CREATE or MODIFY the workflow (e.g. "generate…", "add a Slack node after approval", "replace the model", "optimize", "convert to parallel", "add retry"). Return action "edit", set "graph" to the COMPLETE new graph (full replacement, not a diff), and write a short "message" (Thai, 1-3 sentences) explaining what you changed.
- "answer": the user is ASKING (explain / summarize / detect errors / suggest improvements / debug / recommend nodes / general question). Return action "answer", set "graph" to null, and put the full helpful reply in "message" (Thai, concise, use short bullet lines when listing).

Rules for graphs when editing:
- Keep existing node ids and positions where they still make sense; new nodes get ids like n1, n2… and are placed in a left-to-right grid (x = 80 + col*240, y = 60 + row*130) without overlapping.
- Start flows with a trigger node unless one exists. For "if" nodes label the outgoing edges "true"/"false". Fill config minimally but validly.`,
      });

      let graph: z.infer<typeof GraphSchema> | null = null;
      if (object.action === "edit" && object.graph) {
        const parsed = GraphSchema.parse(object.graph);
        const typeErr = validateTypes(parsed);
        if (typeErr) return Response.json({ error: typeErr }, { status: 400 });
        graph = parsed;
      }
      return Response.json({ action: object.action, message: object.message, graph });
    } catch (e) {
      return Response.json({ error: String(e) }, { status: 400 });
    }
  }

  return Response.json({ error: "mode must be plan, generate, build or assist" }, { status: 400 });
}
