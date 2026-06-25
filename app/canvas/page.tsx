"use client";
import { useCallback, useState } from "react";
import { ReactFlow, Background, Controls, addEdge,
  useNodesState, useEdgesState, type Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const palette = ["trigger", "ai.instruct", "if", "transform", "http.request", "email.send"];

function toGraph(nodes: any[], edges: any[]) {
  return {
    nodes: nodes.map((n) => ({
      id: n.id, type: n.data.label, config: n.data.config ?? {}, onError: "stop",
      next: edges.filter((e) => e.source === n.id).map((e) => e.target),
      position: n.position,
    })),
    edges: edges.map((e) => ({ from: e.source, to: e.target })),
  };
}

async function save(nodes: any[], edges: any[]) {
  const res = await fetch("/api/workflows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "my flow", graph: toGraph(nodes, edges) }),
  });
  const data = await res.json();
  alert("saved! id: " + data.id);
}

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [seq, setSeq] = useState(1);

  const addNode = (type: string) => {
    const id = "n" + seq; setSeq(seq + 1);
    setNodes((ns) => [...ns, { id, position: { x: 120, y: 80 * ns.length + 60 }, data: { label: type }, type: "default" }]);
  };
  const onConnect = useCallback((c: Connection) => setEdges((e) => addEdge(c, e)), [setEdges]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 160, padding: 12, borderRight: "1px solid #eee" }}>
        {palette.map((t) => (
          <button key={t} onClick={() => addNode(t)} style={{ display: "block", width: "100%", margin: "4px 0" }}>{t}</button>
        ))}
        <hr />
        <button onClick={() => save(nodes, edges)}>💾 Save</button>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
          <Background /><Controls />
        </ReactFlow>
      </div>
    </div>
  );
}