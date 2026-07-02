"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeMeta } from "@/lib/nodes/types";
import { CATEGORY_ORDER, nodeCategory } from "@/lib/studio/nodeUi";
import { NodeGlyph } from "@/components/studio/NodeGlyph";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Command-palette style node picker (VS Code feel). */
export default function NodePicker({
  metas,
  open,
  onClose,
  onPick,
}: {
  metas: NodeMeta[];
  open: boolean;
  onClose: () => void;
  onPick: (type: string) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return metas.filter(
      (m) =>
        !s ||
        m.label.toLowerCase().includes(s) ||
        m.type.toLowerCase().includes(s) ||
        m.description.toLowerCase().includes(s),
    );
  }, [metas, q]);

  const grouped = useMemo(() => {
    const g: Record<string, NodeMeta[]> = {};
    for (const m of filtered) (g[nodeCategory(m.type)] ??= []).push(m);
    return CATEGORY_ORDER.filter((c) => g[c]?.length).map((c) => ({ category: c, items: g[c] }));
  }, [filtered]);

  // flat order matching the grouped render, for keyboard nav
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  if (!open) return null;

  const pick = (type: string) => {
    onPick(type);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-900/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mt-[16vh] w-[520px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-violet-200/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Icon.Search size={16} className="text-muted-2" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, flat.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (flat[active]) pick(flat[active].type);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search nodes…"
            className="h-12 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-2"
          />
          <kbd className="ds-kbd">esc</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-muted-2">No matching nodes</div>
          ) : (
            grouped.map((g) => (
              <div key={g.category} className="mb-1">
                <div className="ds-section-title px-2 py-1">{g.category}</div>
                {g.items.map((m) => {
                  const idx = flat.indexOf(m);
                  const isActive = idx === active;
                  return (
                    <button
                      key={m.type}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => pick(m.type)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition",
                        isActive ? "bg-primary-soft" : "hover:bg-surface-muted",
                      )}
                    >
                      <NodeGlyph type={m.type} size={34} className="rounded-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {m.label}
                        </span>
                        <span className="block truncate text-[11.5px] text-muted">
                          {m.description}
                        </span>
                      </span>
                      {isActive && <kbd className="ds-kbd">↵</kbd>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
