"use client";

import { useRef, useState } from "react";
import type { FieldSpec, NodeMeta } from "@/lib/nodes/types";
import type { Graph } from "@/lib/graph";
import { availableVars, type NodeVars } from "@/lib/picker";

type Config = Record<string, unknown>;

export default function NodeConfigForm({
  meta,
  config,
  onChange,
  graph,
  currentNodeId,
}: {
  meta: NodeMeta;
  config: Config;
  onChange: (next: Config) => void;
  graph?: Graph;
  currentNodeId?: string;
}) {
  const set = (name: string, value: unknown) => onChange({ ...config, [name]: value });
  const vars = graph ? availableVars(graph, currentNodeId) : [];

  if (meta.fields.length === 0) {
    return (
      <p style={{ fontSize: 12, color: "#736e8f" }}>
        node นี้ไม่มี config (รับ payload จาก trigger โดยตรง)
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {meta.fields.map((f) => (
        <Field
          key={f.name}
          spec={f}
          value={config[f.name]}
          onChange={(v) => set(f.name, v)}
          vars={vars}
        />
      ))}
    </div>
  );
}

function Field({
  spec,
  value,
  onChange,
  vars,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
  vars: NodeVars[];
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
    color: "#2e2a44",
  };

  const canPick = spec.kind === "text" || spec.kind === "textarea";
  const strVal = (value as string) ?? "";

  if (spec.kind === "slider") {
    const min = spec.min ?? 0;
    const max = spec.max ?? 1;
    const step = spec.step ?? 0.1;
    const current =
      typeof value === "number" ? value : spec.default ?? (max - min) / 2 + min;
    const pct = ((current - min) / (max - min)) * 100;
    return (
      <label className="block">
        <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-foreground">
          <span>
            {spec.label}
            {spec.required && <span className="text-rose-500"> *</span>}
          </span>
          <span className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-[11px] text-muted">
            {current.toFixed(step < 1 ? 1 : 0)}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow"
          style={{
            background: `linear-gradient(to right, #a78bfa 0%, #e0aaf5 ${pct}%, #ece8f6 ${pct}%, #ece8f6 100%)`,
          }}
        />
        {(spec.minLabel || spec.maxLabel) && (
          <div className="mt-1.5 flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted-2">
            <span>{spec.minLabel}</span>
            <span>{spec.maxLabel}</span>
          </div>
        )}
        {spec.help && <div className="mt-2 text-[11px] leading-5 text-muted">{spec.help}</div>}
      </label>
    );
  }

  function insertVar(nodeId: string, field: string) {
    const token = field ? `{{${nodeId}.${field}}}` : `{{${nodeId}}}`;
    const el = inputRef.current;
    if (el) {
      const start = el.selectionStart ?? strVal.length;
      const end = el.selectionEnd ?? strVal.length;
      const next = strVal.slice(0, start) + token + strVal.slice(end);
      onChange(next);
      setPickerOpen(false);
      setTimeout(() => {
        el.focus();
        const pos = start + token.length;
        el.setSelectionRange(pos, pos);
      }, 0);
    } else {
      onChange(strVal + token);
      setPickerOpen(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (canPick && e.key === "/") {
      e.preventDefault();
      setPickerOpen(true);
    }
  }

  return (
    <label style={{ display: "block", position: "relative" }}>
      <div style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
        <span>
          {spec.label}
          {spec.required && <span style={{ color: "#e11d48" }}> *</span>}
        </span>
        {canPick && vars.length > 0 && (
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            style={{
              fontSize: 11,
              padding: "1px 6px",
              border: "1px solid #ddd6ef",
              borderRadius: 4,
              background: "#f2effb",
              color: "#8b7cf0",
              cursor: "pointer",
            }}
          >
            {"{ }"}
          </button>
        )}
      </div>

      {spec.kind === "textarea" || spec.kind === "json" ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={spec.kind === "json" ? 4 : 3}
          className={spec.kind === "json" ? "ds-input-mono" : "ds-input"}
          placeholder={spec.placeholder}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={canPick ? handleKeyDown : undefined}
        />
      ) : spec.kind === "boolean" ? (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      ) : spec.kind === "number" ? (
        <input
          type="number"
          className="ds-input"
          placeholder={spec.placeholder}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      ) : spec.kind === "select" ? (
        <select
          className="ds-input"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— เลือก —</option>
          {spec.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          className="ds-input"
          placeholder={spec.placeholder}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={canPick ? handleKeyDown : undefined}
        />
      )}

      {pickerOpen && vars.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            right: 0,
            top: "100%",
            marginTop: 4,
            background: "#ffffff",
            border: "1px solid #ece8f6",
            borderRadius: 8,
            boxShadow: "0 12px 32px rgba(139,124,240,0.18)",
            maxHeight: 180,
            overflowY: "auto",
            minWidth: 200,
          }}
        >
          {vars.map((v) => (
            <div key={v.nodeId}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#736e8f",
                  padding: "4px 8px",
                  background: "#f2effb",
                }}
              >
                {v.label} ({v.nodeId})
              </div>
              {v.fields.length > 0 ? (
                v.fields.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => insertVar(v.nodeId, f)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "4px 12px",
                      fontSize: 12,
                      border: "none",
                      background: "none",
                      color: "#2e2a44",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => insertVar(v.nodeId, "")}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "4px 12px",
                    fontSize: 11,
                    color: "#9a95b5",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  (ดู output ใน inspector)
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {spec.help && <div style={{ fontSize: 11, color: "#9a95b5", marginTop: 3 }}>{spec.help}</div>}
    </label>
  );
}
