"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeConfigForm from "@/components/NodeConfigForm";
import type { NodeMeta } from "@/lib/nodes/types";

type OnError = "stop" | "continue" | "route";
type NodeData = {
  type: string;
  label: string;
  config: Record<string, unknown>;
  onError: OnError;
};

const data = (n: Node) => n.data as unknown as NodeData;

function toGraph(nodes: Node[], edges: Edge[]) {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: data(n).type,
      config: data(n).config ?? {},
      onError: data(n).onError ?? "stop",
      next: edges.filter((e) => e.source === n.id).map((e) => e.target),
      position: n.position,
    })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
      label: typeof e.label === "string" && e.label ? e.label : undefined,
    })),
  };
}

export default function Canvas() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [seq, setSeq] = useState(1);

  const [metas, setMetas] = useState<NodeMeta[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [name, setName] = useState("my flow");
  const [workflows, setWorkflows] = useState<{ id: string; name: string }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/nodes")
      .then((r) => r.json())
      .then(setMetas);
    fetch("/api/workflows")
      .then((r) => r.json())
      .then(setWorkflows);
  }, []);

  const metaByType = useMemo(() => {
    const m = new Map<string, NodeMeta>();
    metas.forEach((meta) => m.set(meta.type, meta));
    return m;
  }, [metas]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null;

  const addNode = (type: string) => {
    const id = "n" + seq;
    setSeq(seq + 1);
    const meta = metaByType.get(type);
    setNodes((ns) => [
      ...ns,
      {
        id,
        position: { x: 140, y: 70 * ns.length + 60 },
        type: "default",
        data: { type, label: meta?.label ?? type, config: {}, onError: "stop" },
      },
    ]);
  };

  const onConnect = useCallback(
    (c: Connection) => setEdges((e) => addEdge(c, e)),
    [setEdges],
  );

  const updateNodeData = (id: string, patch: Partial<NodeData>) => {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === id ? { ...n, data: { ...(n.data as object), ...patch } } : n,
      ),
    );
  };

  const setEdgeLabel = (id: string, label: string) => {
    setEdges((es) =>
      es.map((e) => (e.id === id ? { ...e, label: label || undefined } : e)),
    );
  };

  const deleteSelected = () => {
    if (selectedNodeId) {
      setNodes((ns) => ns.filter((n) => n.id !== selectedNodeId));
      setEdges((es) =>
        es.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
      );
      setSelectedNodeId(null);
    }
    if (selectedEdgeId) {
      setEdges((es) => es.filter((e) => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  const save = async (): Promise<string | null> => {
    setBusy(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: workflowId, name, graph: toGraph(nodes, edges) }),
      });
      if (!res.ok) {
        alert("save ล้มเหลว: " + (await res.text()));
        return null;
      }
      const { id } = await res.json();
      setWorkflowId(id);
      setWorkflows((ws) =>
        ws.some((w) => w.id === id) ? ws : [{ id, name }, ...ws],
      );
      return id;
    } finally {
      setBusy(false);
    }
  };

  const load = async (id: string) => {
    const res = await fetch(`/api/workflows/${id}`);
    if (!res.ok) return;
    const wf = await res.json();
    const graph = wf.graph as ReturnType<typeof toGraph>;
    setNodes(
      graph.nodes.map((n) => ({
        id: n.id,
        position: n.position,
        type: "default",
        data: {
          type: n.type,
          label: metaByType.get(n.type)?.label ?? n.type,
          config: n.config ?? {},
          onError: (n.onError as OnError) ?? "stop",
        },
      })),
    );
    setEdges(
      graph.edges.map((e, i) => ({
        id: `e${i}-${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        label: e.label,
      })),
    );
    setName(wf.name);
    setWorkflowId(id);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    const maxN = graph.nodes
      .map((n) => parseInt(n.id.replace(/\D/g, ""), 10))
      .filter((x) => !Number.isNaN(x));
    setSeq((maxN.length ? Math.max(...maxN) : 0) + 1);
  };

  const runNow = async () => {
    const id = await save();
    if (!id) return;
    setBusy(true);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: id, payload: {} }),
      });
      if (!res.ok) {
        alert("run ล้มเหลว: " + (await res.text()));
        return;
      }
      const { runId } = await res.json();
      if (runId) router.push(`/runs/${runId}`);
    } finally {
      setBusy(false);
    }
  };

  const btn: React.CSSProperties = {
    display: "block",
    width: "100%",
    margin: "4px 0",
    padding: "6px 8px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #d4d4d8",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* palette + actions */}
      <div style={{ width: 190, padding: 12, borderRight: "1px solid #eee", overflowY: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6 }}>NODES</div>
        {metas.map((m) => (
          <button key={m.type} onClick={() => addNode(m.type)} style={btn} title={m.description}>
            + {m.label}
          </button>
        ))}

        <hr style={{ margin: "12px 0", border: 0, borderTop: "1px solid #eee" }} />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อ workflow"
          style={{ ...btn, cursor: "text" }}
        />
        <button onClick={save} disabled={busy} style={{ ...btn, background: "#f4f4f5" }}>
          💾 Save
        </button>
        <button
          onClick={runNow}
          disabled={busy}
          style={{ ...btn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" }}
        >
          ▶ Run now
        </button>
        <button onClick={deleteSelected} disabled={!selectedNodeId && !selectedEdgeId} style={btn}>
          🗑 Delete selected
        </button>

        <hr style={{ margin: "12px 0", border: 0, borderTop: "1px solid #eee" }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6 }}>LOAD</div>
        <select
          style={{ ...btn, cursor: "pointer" }}
          value={workflowId ?? ""}
          onChange={(e) => e.target.value && load(e.target.value)}
        >
          <option value="">— เลือก workflow —</option>
          {workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => {
            setSelectedNodeId(n.id);
            setSelectedEdgeId(null);
          }}
          onEdgeClick={(_, e) => {
            setSelectedEdgeId(e.id);
            setSelectedNodeId(null);
          }}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* inspector */}
      {(selectedNode || selectedEdge) && (
        <div style={{ width: 300, padding: 16, borderLeft: "1px solid #eee", overflowY: "auto" }}>
          {selectedNode && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {metaByType.get(data(selectedNode).type)?.label ?? data(selectedNode).type}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 14 }}>
                {selectedNode.id} · {data(selectedNode).type}
              </div>

              <label style={{ display: "block", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>On error</div>
                <select
                  value={data(selectedNode).onError}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { onError: e.target.value as OnError })
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: 13,
                    border: "1px solid #d4d4d8",
                    borderRadius: 6,
                  }}
                >
                  <option value="stop">stop — หยุด run</option>
                  <option value="continue">continue — ข้าม</option>
                  <option value="route">route — ไป edge ชื่อ error</option>
                </select>
              </label>

              {metaByType.has(data(selectedNode).type) && (
                <NodeConfigForm
                  meta={metaByType.get(data(selectedNode).type)!}
                  config={data(selectedNode).config ?? {}}
                  onChange={(cfg) => updateNodeData(selectedNode.id, { config: cfg })}
                />
              )}
            </>
          )}

          {selectedEdge && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Edge</div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 14 }}>
                {selectedEdge.source} → {selectedEdge.target}
              </div>
              <label style={{ display: "block" }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Label</div>
                <input
                  value={(selectedEdge.label as string) ?? ""}
                  onChange={(e) => setEdgeLabel(selectedEdge.id, e.target.value)}
                  placeholder="true / false / error"
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: 13,
                    border: "1px solid #d4d4d8",
                    borderRadius: 6,
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                  ใช้กับ if (true/false) และ error routing (error)
                </div>
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}
