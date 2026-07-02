import { registry } from "@/lib/nodes/registry";
import type { Graph } from "@/lib/graph";

export type NodeVars = {
  nodeId: string;
  type: string;
  label: string;
  fields: string[];
};

export function availableVars(graph: Graph, exceptId?: string): NodeVars[] {
  return graph.nodes
    .filter((n) => n.id !== exceptId)
    .map((n) => {
      const def = registry[n.type];
      const outputFields =
        def && "outputFields" in def && typeof def.outputFields === "function"
          ? (def as { outputFields: (cfg: unknown) => string[] }).outputFields(n.config)
          : [];
      return {
        nodeId: n.id,
        type: n.type,
        label: def?.meta.label ?? n.type,
        fields: outputFields,
      };
    });
}
