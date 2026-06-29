import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  success: "#16a34a",
  failed: "#dc2626",
  skipped: "#a1a1aa",
  running: "#2563eb",
  queued: "#a16207",
};

function Badge({ status }: { status: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        color: "#fff",
        background: STATUS_COLOR[status] ?? "#52525b",
        padding: "2px 8px",
        borderRadius: 999,
      }}
    >
      {status}
    </span>
  );
}

function Json({ value }: { value: unknown }) {
  if (value == null) return <span style={{ color: "#a1a1aa" }}>—</span>;
  return (
    <pre
      style={{
        margin: 0,
        fontSize: 12,
        background: "#fafafa",
        border: "1px solid #eee",
        borderRadius: 6,
        padding: 8,
        overflowX: "auto",
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      workflow: true,
      nodeRuns: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!run) {
    return (
      <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
        <p>ไม่พบ run นี้</p>
        <Link href="/canvas">← กลับไป canvas</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 840,
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          Run · {run.workflow?.name ?? run.workflowId}
        </h1>
        <Badge status={run.status} />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 6, marginBottom: 4 }}>
        {run.id} · trigger: {run.trigger} · {new Date(run.startedAt).toLocaleString()}
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, fontSize: 13 }}>
        <Link href={`/runs/${run.id}`}>↻ Refresh</Link>
        <Link href="/canvas">← Canvas</Link>
      </div>

      {run.nodeRuns.length === 0 ? (
        <p style={{ color: "#888" }}>ยังไม่มี NodeRun (run อาจกำลังประมวลผล — กด Refresh)</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {run.nodeRuns.map((nr, i) => (
            <div
              key={nr.id}
              style={{ border: "1px solid #e4e4e7", borderRadius: 10, padding: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  <span style={{ color: "#a1a1aa", marginRight: 8 }}>#{i + 1}</span>
                  {nr.nodeId}
                </div>
                <Badge status={nr.status} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 4 }}>
                    INPUT
                  </div>
                  <Json value={nr.input} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 4 }}>
                    OUTPUT
                  </div>
                  <Json value={nr.output} />
                </div>
              </div>

              {nr.error && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>
                    ERROR
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: 12,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#991b1b",
                      borderRadius: 6,
                      padding: 8,
                      overflowX: "auto",
                    }}
                  >
                    {nr.error}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
