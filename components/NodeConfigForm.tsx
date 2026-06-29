"use client";

import type { FieldSpec, NodeMeta } from "@/lib/nodes/types";

type Config = Record<string, unknown>;

export default function NodeConfigForm({
  meta,
  config,
  onChange,
}: {
  meta: NodeMeta;
  config: Config;
  onChange: (next: Config) => void;
}) {
  const set = (name: string, value: unknown) => onChange({ ...config, [name]: value });

  if (meta.fields.length === 0) {
    return (
      <p style={{ fontSize: 12, color: "#888" }}>
        node นี้ไม่มี config (รับ payload จาก trigger โดยตรง)
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {meta.fields.map((f) => (
        <Field key={f.name} spec={f} value={config[f.name]} onChange={(v) => set(f.name, v)} />
      ))}
    </div>
  );
}

function Field({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, marginBottom: 4 };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontSize: 13,
    padding: "6px 8px",
    border: "1px solid #d4d4d8",
    borderRadius: 6,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <label style={{ display: "block" }}>
      <div style={labelStyle}>
        {spec.label}
        {spec.required && <span style={{ color: "#dc2626" }}> *</span>}
      </div>

      {spec.kind === "textarea" || spec.kind === "json" ? (
        <textarea
          rows={spec.kind === "json" ? 4 : 3}
          style={{ ...inputStyle, fontFamily: spec.kind === "json" ? "monospace" : "inherit" }}
          placeholder={spec.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
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
          style={inputStyle}
          placeholder={spec.placeholder}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      ) : spec.kind === "select" ? (
        <select style={inputStyle} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">— เลือก —</option>
          {spec.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          style={inputStyle}
          placeholder={spec.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {spec.help && <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{spec.help}</div>}
    </label>
  );
}
