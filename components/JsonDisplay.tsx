"use client";

function isTruncated(v: unknown): v is { __truncated: true; preview: string } {
  return (
    v != null &&
    typeof v === "object" &&
    "__truncated" in v &&
    (v as { __truncated: unknown }).__truncated === true
  );
}

export default function JsonDisplay({ value }: { value: unknown }) {
  if (value == null) {
    return <span style={{ fontSize: 12, color: "#9a95b5" }}>—</span>;
  }

  const preStyle: React.CSSProperties = {
    fontSize: 11,
    background: "#fbfaff",
    border: "1px solid #ece8f6",
    color: "#3f3a52",
    padding: 10,
    borderRadius: 10,
    overflow: "auto",
    maxHeight: 240,
    margin: 0,
  };

  if (isTruncated(value)) {
    return (
      <div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#b45309",
            background: "#fef3c7",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          ตัดทอน
        </span>
        <pre style={{ ...preStyle, marginTop: 6, maxHeight: 200 }}>{value.preview}</pre>
      </div>
    );
  }

  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);

  return <pre style={preStyle}>{text}</pre>;
}
