import { registry } from "@/lib/nodes/registry";
import type { Graph } from "@/lib/graph";

export type NodeVars = {
  nodeId: string;
  type: string;
  label: string;
  fields: string[]; // field ที่ node นี้คายออก ([] = เดาไม่ได้ → B ดู NodeRun.output ล่าสุด)
};

/**
 * #24 — ให้ variable picker ของ B: list field ของแต่ละ node
 * เรียก `availableVars(graph, currentNodeId)` → B เอาไปทำ dropdown insert `{{nodeId.field}}`
 * (v1 คืนทุก node ยกเว้นตัวเอง · B จะกรองเฉพาะ node ก่อนหน้าเองก็ได้)
 */
export function availableVars(graph: Graph, exceptId?: string): NodeVars[] {
  return graph.nodes
    .filter((n) => n.id !== exceptId)
    .map((n) => {
      const def = registry[n.type];
      return {
        nodeId: n.id,
        type: n.type,
        label: def?.meta.label ?? n.type,
        fields: def?.outputFields ? def.outputFields(n.config) : [],
      };
    });
}
