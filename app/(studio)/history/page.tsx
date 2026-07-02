"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/studio/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";

type Run = {
  id: string;
  status: string;
  trigger: string;
  startedAt: string;
  workflowName: string;
  nodeCount: number;
};

const STATUS_TONE: Record<string, "emerald" | "rose" | "sky" | "amber" | "neutral"> = {
  success: "emerald",
  failed: "rose",
  running: "sky",
  queued: "amber",
};

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((d) => setRuns(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Execution history"
        description="Every run, with status, trigger, and node-level detail."
      />

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          <div>Workflow</div>
          <div>Status</div>
          <div>Trigger</div>
          <div>Nodes</div>
          <div>Started</div>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse bg-surface-muted" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
              <Icon.History size={22} />
            </div>
            <div>
              <div className="text-[15px] font-medium text-foreground">No runs yet</div>
              <div className="text-[13px] text-muted">Execute a workflow to see it here.</div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {runs.map((r) => (
              <Link
                key={r.id}
                href={`/runs/${r.id}`}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition hover:bg-surface-muted"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Icon.Workflow size={15} />
                  </span>
                  <span className="truncate text-[13.5px] font-medium text-foreground">
                    {r.workflowName}
                  </span>
                </div>
                <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>
                  <Icon.Dot size={8} /> {r.status}
                </Badge>
                <span className="text-[12.5px] text-muted">{r.trigger}</span>
                <span className="text-[12.5px] text-muted">{r.nodeCount}</span>
                <span className="text-[12.5px] text-muted-2">
                  {new Date(r.startedAt).toLocaleString("en-GB")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
