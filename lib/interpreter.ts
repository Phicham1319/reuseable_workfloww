import { prisma } from "@/lib/db";
import { registry } from "@/lib/nodes/registry";
import { resolveConfig } from "@/lib/template";
import { capJson } from "@/lib/runs";
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

export type StepRunner = <T>(id: string, fn: () => Promise<T>) => Promise<T>;

export const directRunner: StepRunner = (_id, fn) => fn();

export type RunWorkflowArgs = {
  graph: unknown;
  runId: string;
  payload?: Record<string, unknown>;
  step?: StepRunner;
  startNodeId?: string;
  stopNodeId?: string;
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

function findStart(graph: Graph): Node | undefined {
  const trigger = graph.nodes.find((n) => n.type === "trigger");
  if (trigger) return trigger;
  const hasIncoming = new Set(graph.edges.map((e) => e.to));
  const root = graph.nodes.find((n) => !hasIncoming.has(n.id));
  return root ?? graph.nodes[0];
}

function forward(output: Envelope): Envelope {
  if (!("__branch" in output.data)) return output;
  const { __branch, ...rest } = output.data;
  void __branch;
  return { ...output, data: rest };
}

function nextEdges(edges: Edge[], node: Node, output: Envelope): Edge[] {
  const out = outgoing(edges, node.id);
  const branch = output.data.__branch;
  if (branch != null) {
    return out.filter((e) => e.label === String(branch));
  }
  return out.filter((e) => e.label !== "error");
}

export async function runWorkflow({
  graph: rawGraph,
  runId,
  payload = {},
  step = directRunner,
  startNodeId,
  stopNodeId,
}: RunWorkflowArgs): Promise<RunWorkflowResult> {
  const graph = GraphSchema.parse(rawGraph);
  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));

  const start =
    (startNodeId ? nodesById.get(startNodeId) : undefined) ?? findStart(graph);
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
  const outputs: Record<string, unknown> = {};
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
      const { config: resolvedConfig, missing } = resolveConfig(node.config, {
        steps: outputs,
        data: input.data,
      });
      if (missing.length > 0) {
        console.warn(`[${runId}/${nodeId}] template paths not found: ${missing.join(", ")}`);
      }
      try {
        output = await step(nodeId, () => def.run(resolvedConfig, input, ctx));
      } catch (e) {
        output = fail(errMsg(e));
      }
    }

    await step(`${nodeId}:log`, async () => {
      await prisma.nodeRun.create({
        data: {
          runId,
          nodeId,
          status: output.status,
          input: capJson(input) as Prisma.InputJsonValue,
          output: capJson(output) as Prisma.InputJsonValue,
          error: output.error ?? null,
        },
      });
      return null;
    });
    nodeRuns++;
    outputs[nodeId] = output.data;

    if (stopNodeId && node.id === stopNodeId) {
      break;
    }

    if (output.status === "failed") {
      if (node.onError === "stop") {
        runStatus = "failed";
        break;
      }
      if (node.onError === "continue") {
        continue;
      }
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
