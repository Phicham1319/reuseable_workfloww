"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeToolbar,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import NodeConfigForm from "@/components/NodeConfigForm";
import JsonDisplay from "@/components/JsonDisplay";
import AiHelperPanel, { type SelectedNodeCtx } from "@/components/AiHelperPanel";
import NodePicker from "@/components/studio/NodePicker";
import { NodeGlyph } from "@/components/studio/NodeGlyph";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { NodeMeta } from "@/lib/nodes/types";
import type { Graph } from "@/lib/graph";

type OnError = "stop" | "continue" | "route";
type NodeData = {
  type: string;
  label: string;
  config: Record<string, unknown>;
  onError: OnError;
};

type LatestRun = {
  runId: string;
  status: string;
  nodeRuns: {
    nodeId: string;
    input: unknown;
    output: unknown;
    error: string | null;
    status: string;
  }[];
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const data = (n: Node) => n.data as unknown as NodeData;

const RunStatusContext = createContext<Record<string, string>>({});

type NodeActions = {
  test: (id: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  configure: (id: string) => void;
};
const NodeActionsContext = createContext<NodeActions | null>(null);

function ToolbarBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition",
        danger
          ? "text-rose-500 hover:bg-rose-50"
          : "text-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  shortcut,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition",
        danger ? "text-rose-500 hover:bg-rose-50" : "text-foreground hover:bg-surface-muted",
      )}
    >
      <span className={danger ? "text-rose-400" : "text-muted-2"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="font-mono text-[11px] text-muted-2">{shortcut}</span>
      )}
    </button>
  );
}

function NodeContextMenu({
  x,
  y,
  onClose,
  onTest,
  onDuplicate,
  onCopy,
  onConfigure,
  onDelete,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onTest: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onConfigure: () => void;
  onDelete: () => void;
}) {
  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[130]" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div
        className="absolute w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-2xl shadow-violet-200/50"
        style={{ left: Math.min(x, window.innerWidth - 240), top: Math.min(y, window.innerHeight - 260) }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem icon={<Icon.Settings size={15} />} label="Configure" shortcut="⌘." onClick={run(onConfigure)} />
        <MenuItem icon={<Icon.Play size={13} />} label="Test node" onClick={run(onTest)} />
        <MenuItem icon={<Icon.Layers size={15} />} label="Duplicate" shortcut="⌘D" onClick={run(onDuplicate)} />
        <MenuItem icon={<Icon.Copy size={15} />} label="Copy JSON" shortcut="⌘C" onClick={run(onCopy)} />
        <div className="my-1 h-px bg-border" />
        <MenuItem icon={<Icon.Trash size={15} />} label="Delete" shortcut="⌫" danger onClick={run(onDelete)} />
      </div>
    </div>
  );
}

function stateStyle(status: string | undefined, selected: boolean) {
  if (selected) return "border-violet-300 ring-4 ring-violet-200/60";
  switch (status) {
    case "failed":
      return "border-rose-300";
    case "success":
      return "border-emerald-300";
    case "skipped":
      return "border-border";
    case undefined:
      return "border-border hover:border-violet-200";
    default:
      return "border-sky-300 ring-4 ring-sky-100"; // running / queued
  }
}

function statusDot(status?: string): string {
  switch (status) {
    case "success":
      return "bg-emerald-400";
    case "failed":
      return "bg-rose-400";
    case "skipped":
      return "bg-slate-300";
    case undefined:
      return "";
    default:
      return "bg-sky-400 animate-pulse";
  }
}

function WorkflowNode({ id, data: nodeData, selected }: NodeProps) {
  const statusMap = useContext(RunStatusContext);
  const actions = useContext(NodeActionsContext);
  const d = nodeData as unknown as NodeData;
  const status = statusMap[id];
  const dot = statusDot(status);

  return (
    <>
      <NodeToolbar
        isVisible={!!selected}
        position={Position.Top}
        offset={10}
        className="flex items-center gap-0.5 rounded-2xl border border-border bg-surface p-1 shadow-lg shadow-violet-200/40"
      >
        <ToolbarBtn label="Test node" onClick={() => actions?.test(id)}>
          <Icon.Play size={13} />
        </ToolbarBtn>
        <ToolbarBtn label="Configure" onClick={() => actions?.configure(id)}>
          <Icon.Settings size={15} />
        </ToolbarBtn>
        <ToolbarBtn label="Duplicate" onClick={() => actions?.duplicate(id)}>
          <Icon.Copy size={15} />
        </ToolbarBtn>
        <span className="mx-0.5 h-4 w-px bg-border" />
        <ToolbarBtn label="Delete" danger onClick={() => actions?.remove(id)}>
          <Icon.Trash size={15} />
        </ToolbarBtn>
      </NodeToolbar>
      <div
        className={cn(
          "relative flex w-56 items-center gap-2.5 rounded-full border bg-surface py-1.5 pl-1.5 pr-4 shadow-sm shadow-violet-100/60 transition",
          stateStyle(status, !!selected),
        )}
      >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-violet-300"
      />
      <NodeGlyph type={d.type} size={38} className="!rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold leading-tight text-foreground">
          {d.label}
        </div>
        <div className="truncate text-[11px] leading-tight text-muted-2">{d.type}</div>
      </div>
      {dot && (
        <span className={cn("absolute right-3 top-2 h-2 w-2 rounded-full", dot)} />
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-violet-300"
      />
      </div>
    </>
  );
}

const nodeTypes = { workflow: WorkflowNode };

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  animated: true,
  style: { stroke: "#a78bfa", strokeWidth: 2 },
};

export function toGraph(nodes: Node[], edges: Edge[]): Graph {
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

function CanvasInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const seqRef = useRef(1);
  const [rf, setRf] = useState<ReactFlowInstance<Node, Edge> | null>(null);

  const [metas, setMetas] = useState<NodeMeta[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled workflow");
  const [workflows, setWorkflows] = useState<{ id: string; name: string }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [latestRun, setLatestRun] = useState<LatestRun | null>(null);
  const [ioTab, setIoTab] = useState<"input" | "output">("output");
  const [testOpen, setTestOpen] = useState(false);
  const [testInput, setTestInput] = useState("{}");
  const [testBusy, setTestBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const skipAutosave = useRef(true);
  const loadedRef = useRef(false);

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

  const graph = useMemo(() => toGraph(nodes, edges), [nodes, edges]);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null;
  const selectedNodeRun = latestRun?.nodeRuns.find((nr) => nr.nodeId === selectedNodeId);

  const selectedNodeCtx: SelectedNodeCtx = selectedNode
    ? {
        id: selectedNode.id,
        type: data(selectedNode).type,
        label: metaByType.get(data(selectedNode).type)?.label ?? data(selectedNode).type,
        config: data(selectedNode).config ?? {},
      }
    : null;

  const statusByNode = useMemo(() => {
    const m: Record<string, string> = {};
    latestRun?.nodeRuns.forEach((nr) => {
      m[nr.nodeId] = nr.status;
    });
    return m;
  }, [latestRun]);

  const applyGraph = useCallback(
    (g: Graph) => {
      setNodes(
        g.nodes.map((n) => ({
          id: n.id,
          position: n.position,
          type: "workflow",
          data: {
            type: n.type,
            label: metaByType.get(n.type)?.label ?? n.type,
            config: n.config ?? {},
            onError: (n.onError as OnError) ?? "stop",
          },
        })),
      );
      setEdges(
        g.edges.map((e, i) => ({
          id: `e${i}-${e.from}-${e.to}`,
          source: e.from,
          target: e.to,
          label: e.label,
        })),
      );
      const maxN = g.nodes
        .map((n) => parseInt(n.id.replace(/\D/g, ""), 10))
        .filter((x) => !Number.isNaN(x));
      seqRef.current = (maxN.length ? Math.max(...maxN) : 0) + 1;
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    },
    [metaByType, setNodes, setEdges],
  );

  const load = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/workflows/${id}`);
      if (!res.ok) return;
      const wf = await res.json();
      applyGraph(wf.graph as Graph);
      setName(wf.name);
      setWorkflowId(id);
      skipAutosave.current = true;
    },
    [applyGraph],
  );

  const refreshLatestRun = useCallback(async (wfId: string) => {
    const res = await fetch(`/api/workflows/${wfId}/latest-run`);
    if (res.ok) setLatestRun(await res.json());
  }, []);

  useEffect(() => {
    if (metas.length === 0 || loadedRef.current) return;
    loadedRef.current = true;

    const id = searchParams.get("id");
    const isNew = searchParams.get("new");

    if (id) {
      load(id).then(() => {
        skipAutosave.current = false;
        refreshLatestRun(id);
      });
    } else if (isNew) {
      const pending = sessionStorage.getItem("pendingGraph");
      if (pending) {
        try {
          applyGraph(JSON.parse(pending) as Graph);
          sessionStorage.removeItem("pendingGraph");
          setName("AI workflow");
        } catch {
          /* ignore */
        }
      }
      skipAutosave.current = false;
    } else {
      skipAutosave.current = false;
    }
  }, [metas, searchParams, load, applyGraph, refreshLatestRun]);

  useEffect(() => {
    if (workflowId) refreshLatestRun(workflowId);
  }, [workflowId, refreshLatestRun]);

  const save = useCallback(async (): Promise<string | null> => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: workflowId, name, graph: toGraph(nodes, edges) }),
      });
      if (!res.ok) {
        setSaveStatus("error");
        return null;
      }
      const { id } = await res.json();
      setWorkflowId(id);
      setWorkflows((ws) => (ws.some((w) => w.id === id) ? ws : [{ id, name }, ...ws]));
      setSaveStatus("saved");
      return id;
    } catch {
      setSaveStatus("error");
      return null;
    }
  }, [workflowId, name, nodes, edges]);

  useEffect(() => {
    if (skipAutosave.current) return;
    setSaveStatus("idle");
    const t = setTimeout(() => save(), 1500);
    return () => clearTimeout(t);
  }, [nodes, edges, name, save]);

  const addNode = (type: string) => {
    const meta = metaByType.get(type);
    setNodes((ns) => {
      const id = "n" + seqRef.current++;
      const i = ns.length;
      const position = { x: 120 + (i % 4) * 260, y: 100 + Math.floor(i / 4) * 160 };
      return [
        ...ns,
        {
          id,
          position,
          type: "workflow",
          data: { type, label: meta?.label ?? type, config: {}, onError: "stop" },
        },
      ];
    });
  };

  useEffect(() => {
    if (rf && nodes.length > 0) {
      const t = setTimeout(() => rf.fitView({ padding: 0.25, duration: 200 }), 0);
      return () => clearTimeout(t);
    }
  }, [rf, nodes.length]);

  // global "/" opens the node picker (VS Code palette feel)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing) return;
      if (e.key === "/" || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setPickerOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onConnect = useCallback((c: Connection) => setEdges((e) => addEdge(c, e)), [setEdges]);

  const updateNodeData = (id: string, patch: Partial<NodeData>) => {
    setNodes((ns) =>
      ns.map((n) => (n.id === id ? { ...n, data: { ...(n.data as object), ...patch } } : n)),
    );
  };

  const setEdgeLabel = (id: string, label: string) => {
    setEdges((es) => es.map((e) => (e.id === id ? { ...e, label: label || undefined } : e)));
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

  const removeNode = useCallback(
    (id: string) => {
      setNodes((ns) => ns.filter((n) => n.id !== id));
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
      setSelectedNodeId((cur) => (cur === id ? null : cur));
    },
    [setNodes, setEdges],
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const newId = "n" + seqRef.current++;
      setNodes((ns) => {
        const src = ns.find((n) => n.id === id);
        if (!src) return ns;
        return [
          ...ns.map((n) => ({ ...n, selected: false })),
          {
            ...src,
            id: newId,
            selected: true,
            position: { x: src.position.x + 48, y: src.position.y + 64 },
            data: { ...(src.data as object) },
          },
        ];
      });
      setSelectedNodeId(newId);
      setSelectedEdgeId(null);
    },
    [setNodes],
  );

  const copyNode = useCallback(
    (id: string) => {
      const n = nodes.find((x) => x.id === id);
      if (n) {
        navigator.clipboard
          ?.writeText(JSON.stringify({ type: data(n).type, config: data(n).config }, null, 2))
          .catch(() => {});
      }
    },
    [nodes],
  );

  const nodeActions = useMemo<NodeActions>(
    () => ({
      test: (id) => {
        setSelectedNodeId(id);
        setSelectedEdgeId(null);
        setTestOpen(true);
      },
      duplicate: duplicateNode,
      remove: removeNode,
      configure: (id) => {
        setSelectedNodeId(id);
        setSelectedEdgeId(null);
      },
    }),
    [duplicateNode, removeNode],
  );

  // shortcuts for the selected node (⌘D duplicate, esc close menu / deselect)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "Escape") {
        setMenu(null);
        return;
      }
      if (typing) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && selectedNodeId) {
        e.preventDefault();
        duplicateNode(selectedNodeId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNodeId, duplicateNode]);

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

  const runTest = async () => {
    if (!selectedNodeId) return;
    const id = await save();
    if (!id) return;
    setTestBusy(true);
    try {
      let sampleInput: Record<string, unknown> = {};
      try {
        sampleInput = JSON.parse(testInput);
      } catch {
        alert("JSON ไม่ถูกต้อง");
        return;
      }
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: id,
          startNodeId: selectedNodeId,
          stopNodeId: selectedNodeId,
          sampleInput,
        }),
      });
      if (!res.ok) {
        alert("test ล้มเหลว: " + (await res.text()));
        return;
      }
      setTestOpen(false);
      await refreshLatestRun(id);
    } finally {
      setTestBusy(false);
    }
  };

  const savePill =
    saveStatus === "saving"
      ? { text: "Saving…", cls: "bg-surface-muted text-muted" }
      : saveStatus === "saved"
        ? { text: "Saved", cls: "bg-emerald-100 text-emerald-600" }
        : saveStatus === "error"
          ? { text: "Save failed", cls: "bg-rose-100 text-rose-600" }
          : { text: "Unsaved", cls: "bg-amber-100 text-amber-600" };

  const fieldInput = "ds-input";

  return (
    <div className="flex h-screen flex-col text-foreground">
      {/* ── Top bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/70 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="ds-brand h-8 w-8"
            title="Back to dashboard"
          >
            <Icon.Sparkles size={16} className="text-white" />
          </Link>
          <div className="flex items-center gap-2 text-[13px] text-muted-2">
            <span>Workflows</span>
            <span>/</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workflow name"
              className="w-52 rounded-lg border border-transparent bg-transparent px-2 py-1 text-[14px] font-semibold text-foreground outline-none transition hover:bg-surface-muted focus:border-violet-300 focus:bg-surface"
            />
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", savePill.cls)}>
            {savePill.text}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={workflowId ?? ""}
            onChange={(e) => e.target.value && load(e.target.value)}
            className="max-w-40 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-muted outline-none transition focus:border-violet-300"
          >
            <option value="">Open…</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <span className="hidden items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-[12.5px] text-muted sm:flex">
            v3 <span className="text-muted-2">▾</span>
          </span>
          <button
            onClick={() => save()}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground shadow-sm transition hover:bg-surface-muted"
          >
            Publish
          </button>
          <button
            onClick={runNow}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-violet-300/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon.Play size={13} /> {busy ? "Running…" : "Run"}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── AI Copilot (always visible) ── */}
        <AiHelperPanel graph={graph} selectedNode={selectedNodeCtx} onApply={applyGraph} />

        {/* ── Canvas ── */}
        <main className="relative min-w-0 flex-1">
          <RunStatusContext.Provider value={statusByNode}>
            <NodeActionsContext.Provider value={nodeActions}>
              <ReactFlow
                colorMode="light"
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                onInit={setRf}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, n) => {
                  setSelectedNodeId(n.id);
                  setSelectedEdgeId(null);
                }}
                onNodeContextMenu={(e, n) => {
                  e.preventDefault();
                  setSelectedNodeId(n.id);
                  setSelectedEdgeId(null);
                  setMenu({ id: n.id, x: e.clientX, y: e.clientY });
                }}
                onEdgeClick={(_, e) => {
                  setSelectedEdgeId(e.id);
                  setSelectedNodeId(null);
                }}
                onPaneClick={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                  setMenu(null);
                }}
                proOptions={{ hideAttribution: true }}
                fitView
              >
                <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="#dcd6f0" />
                <MiniMap
                  pannable
                  zoomable
                  className="!bottom-4 !right-4 !rounded-xl !border !border-border !bg-surface"
                  maskColor="rgba(139,124,240,0.10)"
                  nodeColor="#a78bfa"
                />
                <Controls className="!rounded-xl !border !border-border !bg-surface !shadow-sm" />
              </ReactFlow>
            </NodeActionsContext.Provider>
          </RunStatusContext.Provider>

          {/* right-click context menu */}
          {menu && (
            <NodeContextMenu
              x={menu.x}
              y={menu.y}
              onClose={() => setMenu(null)}
              onTest={() => nodeActions.test(menu.id)}
              onDuplicate={() => duplicateNode(menu.id)}
              onCopy={() => copyNode(menu.id)}
              onConfigure={() => nodeActions.configure(menu.id)}
              onDelete={() => removeNode(menu.id)}
            />
          )}

          {/* empty state */}
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl border border-dashed border-border-strong bg-surface/70 px-7 py-6 text-center backdrop-blur">
                <div className="text-[15px] font-medium text-foreground">Start building</div>
                <div className="mt-1 text-[13px] text-muted">
                  Press <kbd className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] text-muted">/</kbd> to add
                  a node — or ask the copilot on the left.
                </div>
              </div>
            </div>
          )}

          {/* floating add-node bar */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <button
              onClick={() => setPickerOpen(true)}
              className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-foreground shadow-lg shadow-violet-200/40 transition hover:border-violet-200 hover:bg-surface-muted"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white">
                <Icon.Plus size={15} />
              </span>
              Add node
              <kbd className="ds-kbd ml-1">/</kbd>
            </button>
          </div>

          {/* floating inspector (right) */}
          {(selectedNode || selectedEdge) && (
            <div className="absolute right-4 top-4 max-h-[calc(100vh-8rem)] w-[340px] overflow-y-auto rounded-2xl border border-border bg-surface/95 p-5 shadow-2xl shadow-violet-200/40 backdrop-blur-xl">
              {selectedNode && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <NodeGlyph type={data(selectedNode).type} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold text-foreground">
                        {metaByType.get(data(selectedNode).type)?.label ?? data(selectedNode).type}
                      </div>
                      <div className="truncate text-[11px] text-muted-2">
                        {selectedNode.id} · {data(selectedNode).type}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-2 transition hover:bg-surface-muted hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <button
                    onClick={() => setTestOpen(true)}
                    className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-600 transition hover:bg-emerald-100"
                  >
                    <Icon.Play size={13} /> Test this node
                  </button>

                  <label className="mb-5 block">
                    <div className="mb-2 text-[12px] font-semibold text-foreground">On error</div>
                    <select
                      value={data(selectedNode).onError}
                      onChange={(e) =>
                        updateNodeData(selectedNode.id, { onError: e.target.value as OnError })
                      }
                      className={fieldInput}
                    >
                      <option value="stop">stop — halt run</option>
                      <option value="continue">continue — skip</option>
                      <option value="route">route — go to “error” edge</option>
                    </select>
                  </label>

                  {metaByType.has(data(selectedNode).type) && (
                    <NodeConfigForm
                      meta={metaByType.get(data(selectedNode).type)!}
                      config={data(selectedNode).config ?? {}}
                      onChange={(cfg) => updateNodeData(selectedNode.id, { config: cfg })}
                      graph={graph}
                      currentNodeId={selectedNode.id}
                    />
                  )}

                  <div className="my-5 border-t border-border" />

                  <div className="mb-3 text-[12px] font-semibold text-foreground">Last run I/O</div>
                  {!selectedNodeRun ? (
                    <p className="rounded-xl border border-dashed border-border-strong bg-surface-muted px-3 py-2 text-[11px] text-muted">
                      No data yet — run or test this node.
                    </p>
                  ) : (
                    <>
                      <div className="mb-2 flex gap-1 rounded-xl bg-surface-muted p-1">
                        {(["input", "output"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setIoTab(tab)}
                            className={cn(
                              "flex-1 rounded-lg px-3 py-1.5 text-[12px] font-medium transition",
                              ioTab === tab
                                ? "bg-surface text-foreground shadow-sm"
                                : "text-muted-2 hover:text-foreground",
                            )}
                          >
                            {tab === "input" ? "Input" : "Output"}
                          </button>
                        ))}
                      </div>
                      <JsonDisplay
                        value={ioTab === "input" ? selectedNodeRun.input : selectedNodeRun.output}
                      />
                      {selectedNodeRun.error && (
                        <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-[11px] text-rose-600">
                          {selectedNodeRun.error}
                        </p>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedEdge && (
                <>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-[15px] font-semibold text-foreground">Edge</div>
                    <button
                      onClick={() => setSelectedEdgeId(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-2 transition hover:bg-surface-muted hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mb-4 text-[11px] text-muted-2">
                    {selectedEdge.source} → {selectedEdge.target}
                  </div>
                  <label className="block">
                    <div className="mb-2 text-[12px] font-semibold text-foreground">Label</div>
                    <input
                      value={(selectedEdge.label as string) ?? ""}
                      onChange={(e) => setEdgeLabel(selectedEdge.id, e.target.value)}
                      placeholder="true / false / error"
                      className={fieldInput}
                    />
                    <div className="mt-2 text-[11px] leading-5 text-muted">
                      Used by “if” (true/false) and error routing (error).
                    </div>
                  </label>
                  <button
                    onClick={deleteSelected}
                    className="mt-4 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-600 transition hover:bg-rose-100"
                  >
                    Delete edge
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* node picker (command palette) */}
      <NodePicker
        metas={metas}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addNode}
      />

      {/* test modal */}
      {testOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setTestOpen(false)}
        >
          <div
            className="w-[400px] max-w-[90vw] rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-violet-200/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[15px] font-semibold text-foreground">
              Test node: {selectedNodeId}
            </div>
            <p className="mb-3 mt-1 text-[12px] text-muted">
              Provide sample JSON as this node&apos;s input.
            </p>
            <textarea
              rows={6}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="ds-input-mono text-[12px]"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setTestOpen(false)}
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] font-medium text-foreground transition hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                onClick={runTest}
                disabled={testBusy}
                className="flex-1 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 px-3 py-2 text-[13px] font-semibold text-white transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
              >
                {testBusy ? "Running…" : "Run test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Canvas() {
  return (
    <Suspense fallback={<div className="p-6 text-muted">Loading canvas…</div>}>
      <CanvasInner />
    </Suspense>
  );
}
