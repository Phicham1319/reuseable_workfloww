import { prisma } from "@/lib/db";
import { registry } from "@/lib/nodes/registry";
import {
  GraphSchema,
  ok,
  fail,
  type Graph,
  type Node,
  type Edge,
  type Envelope,
  type Ctx,
} from "@/lib/graph";
import type { Prisma } from "@prisma/client";

/**
 * StepRunner = ตัวห่อการรันแต่ละ step.
 * - production: ใช้ inngest `step.run` (durable + retry)
 * - test/local: directRunner เรียก fn ตรง ๆ
 */
export type StepRunner = <T>(id: string, fn: () => Promise<T>) => Promise<T>;

const directRunner: StepRunner = (_id, fn) => fn();

export type RunWorkflowArgs = {
  graph: unknown;
  runId: string;
  payload?: Record<string, unknown>;
  step?: StepRunner;
};

export type RunWorkflowResult = {
  status: "success" | "failed";
  nodeRuns: number;
};

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function outgoing(edges: Edge[], nodeId: string): Edge[] {
  return edges.filter((e) => e.from === nodeId);
}

/** หา node เริ่มต้น: ชอบ type "trigger" → ไม่มี edge เข้า → node แรก */
function findStart(graph: Graph): Node | undefined {
  const trigger = graph.nodes.find((n) => n.type === "trigger");
  if (trigger) return trigger;
  const hasIncoming = new Set(graph.edges.map((e) => e.to));
  const root = graph.nodes.find((n) => !hasIncoming.has(n.id));
  return root ?? graph.nodes[0];
}

/** ตัด field ภายใน (__branch) ออกก่อนส่ง envelope ต่อให้ node ถัดไป */
function forward(output: Envelope): Envelope {
  if (!("__branch" in output.data)) return output;
  const { __branch, ...rest } = output.data;
  void __branch;
  return { ...output, data: rest };
}

/** เลือก edge ถัดไปจากผล node (รองรับ branch ของ if และ default path) */
function nextEdges(edges: Edge[], node: Node, output: Envelope): Edge[] {
  const out = outgoing(edges, node.id);
  const branch = output.data.__branch;
  if (branch != null) {
    return out.filter((e) => e.label === String(branch));
  }
  return out.filter((e) => e.label !== "error");
}

/**
 * เดิน graph จาก trigger ตาม edge → เรียก registry[type].run() ทุก node →
 * เขียน NodeRun → ส่ง output เป็น input ของ node ถัดไป.
 *
 * Error policy ต่อ node (`onError`):
 *  - stop      หยุดทั้ง run + status=failed
 *  - continue  ข้าม node ที่พัง (ไม่เดินต่อจาก node นั้น) แต่ run ไม่ fail
 *  - route     เดินต่อไป edge ที่ label = "error"
 */
export async function runWorkflow({
  graph: rawGraph,
  runId,
  payload = {},
  step = directRunner,
}: RunWorkflowArgs): Promise<RunWorkflowResult> {
  const graph = GraphSchema.parse(rawGraph);
  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));

  const start = findStart(graph);
  if (!start) {
    await step("finalize", async () => {
      await prisma.run.update({ where: { id: runId }, data: { status: "failed" } });
      return null;
    });
    return { status: "failed", nodeRuns: 0 };
  }

  const queue: { nodeId: string; input: Envelope }[] = [
    { nodeId: start.id, input: ok(payload) },
  ];
  const visited = new Set<string>();
  let runStatus: "success" | "failed" = "success";
  let nodeRuns = 0;

  while (queue.length > 0) {
    const { nodeId, input } = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodesById.get(nodeId);
    if (!node) continue;
    const def = registry[node.type];

    let output: Envelope;
    if (!def) {
      output = fail(`unknown node type: ${node.type}`);
    } else {
      const ctx: Ctx = {
        runId,
        nodeId,
        log: (m) => console.log(`[run ${runId} · ${nodeId}] ${m}`),
      };
      try {
        // แต่ละ node = 1 step (durable + retry เมื่อ throw)
        output = await step(nodeId, () => def.run(node.config, input, ctx));
      } catch (e) {
        // ครบ retries แล้วยัง throw → interpreter จับเป็น failed
        output = fail(errMsg(e));
      }
    }

    // เขียน NodeRun (ห่อใน step เพื่อกันเขียนซ้ำตอน retry)
    await step(`${nodeId}:log`, async () => {
      await prisma.nodeRun.create({
        data: {
          runId,
          nodeId,
          status: output.status,
          input: input as unknown as Prisma.InputJsonValue,
          output: output as unknown as Prisma.InputJsonValue,
          error: output.error ?? null,
        },
      });
      return null;
    });
    nodeRuns++;

    if (output.status === "failed") {
      if (node.onError === "stop") {
        runStatus = "failed";
        break;
      }
      if (node.onError === "continue") {
        continue; // ข้าม ไม่เดินต่อจาก node นี้
      }
      // route → ไป edge label "error"
      for (const e of outgoing(graph.edges, nodeId).filter((e) => e.label === "error")) {
        queue.push({ nodeId: e.to, input: forward(output) });
      }
      continue;
    }

    for (const e of nextEdges(graph.edges, node, output)) {
      queue.push({ nodeId: e.to, input: forward(output) });
    }
  }

  await step("finalize", async () => {
    await prisma.run.update({ where: { id: runId }, data: { status: runStatus } });
    return null;
  });

  return { status: runStatus, nodeRuns };
}
