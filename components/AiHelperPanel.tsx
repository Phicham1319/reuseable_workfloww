"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Graph } from "@/lib/graph";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type SelectedNodeCtx = {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
} | null;

type Msg = {
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

type QuickAction = { label: string; prompt: string };

const WORKFLOW_ACTIONS: QuickAction[] = [
  { label: "Generate email approval", prompt: "สร้าง workflow อนุมัติคำขอผ่านอีเมล: รับคำขอ → ให้ AI ตรวจ → ถ้าผ่านส่งอีเมลอนุมัติ" },
  { label: "Explain this workflow", prompt: "อธิบาย workflow นี้ทีละขั้นแบบเข้าใจง่าย" },
  { label: "Detect errors", prompt: "ตรวจหาข้อผิดพลาดหรือจุดที่อาจพังใน workflow นี้" },
  { label: "Optimize performance", prompt: "optimize workflow นี้ให้เร็ว/ประหยัดขึ้น แล้วอธิบายสิ่งที่เปลี่ยน" },
  { label: "Convert to parallel", prompt: "แปลงขั้นตอนที่ทำพร้อมกันได้ให้เป็น parallel execution" },
];

const NODE_ACTIONS: QuickAction[] = [
  { label: "Explain this node", prompt: "อธิบายว่า node ที่เลือกอยู่ทำอะไร และรับ/คายข้อมูลแบบไหน" },
  { label: "Improve prompt", prompt: "ช่วยปรับ prompt ของ node นี้ให้ได้ผลลัพธ์ดีขึ้น" },
  { label: "Add retry after", prompt: "เพิ่ม retry / error handling ต่อจาก node ที่เลือก" },
  { label: "Suggest improvements", prompt: "แนะนำการปรับปรุงสำหรับ node ที่เลือกนี้" },
];

export default function AiHelperPanel({
  graph,
  selectedNode,
  onApply,
}: {
  graph: Graph;
  selectedNode: SelectedNodeCtx;
  onApply: (g: Graph) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I'm your workflow copilot. Ask me to build, explain, optimize, or debug — I can see your canvas and the selected node.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const actions = useMemo(
    () => (selectedNode ? NODE_ACTIONS : WORKFLOW_ACTIONS),
    [selectedNode],
  );

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "assist",
          message: msg,
          currentGraph: graph,
          selectedNode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "request failed");
      if (data.action === "edit" && data.graph) {
        const g = data.graph as Graph;
        onApply(g);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.message, meta: `${g.nodes.length} nodes · updated canvas` },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, that failed: " + String(e) },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-r border-border bg-surface/70 backdrop-blur-xl">
      {/* header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3.5">
        <span className="ds-brand h-8 w-8">
          <Icon.Sparkles size={17} className="text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-foreground">AI Copilot</div>
          <div className="text-[11px] text-muted-2">Understands your canvas</div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
        </span>
      </div>

      {/* context strip */}
      <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-border px-4 py-2.5">
        <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted">
          <Icon.Workflow size={12} className="text-primary" />
          {graph.nodes.length} nodes · {graph.edges.length} edges
        </span>
        {selectedNode && (
          <span className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] text-violet-600">
            <Icon.Dot size={8} /> {selectedNode.label}
          </span>
        )}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3 py-2 text-[12.5px] leading-5",
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white shadow-sm shadow-violet-300/40"
                  : "border border-border bg-surface-2 text-foreground",
              )}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.meta && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                  <Icon.Check size={11} /> {m.meta}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-3 py-2 text-[12.5px] text-muted">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
              </span>
              thinking…
            </div>
          </div>
        )}
      </div>

      {/* quick actions */}
      <div className="shrink-0 px-4 pb-2">
        <div className="ds-section-title mb-1.5">
          {selectedNode ? "For selected node" : "Quick actions"}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => send(a.prompt)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50"
            >
              <Icon.Sparkles size={11} className="text-primary" />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* input */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-1.5 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-ring">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask the copilot to build or edit…"
            className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[13px] text-foreground outline-none placeholder:text-muted-2"
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white shadow-sm shadow-violet-300/40 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon.ArrowRight size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
