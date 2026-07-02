"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/studio/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icons";

type Workflow = { id: string; name: string; createdAt: string; updatedAt?: string };

const STATS: { label: string; value: string; delta: string; icon: IconName; tone: string }[] = [
  { label: "Active workflows", value: "—", delta: "live", icon: "Workflow", tone: "text-violet-500" },
  { label: "Runs (7d)", value: "128", delta: "+18%", icon: "History", tone: "text-emerald-500" },
  { label: "Agents", value: "5", delta: "collaborating", icon: "Agent", tone: "text-fuchsia-500" },
  { label: "Est. cost (7d)", value: "$4.20", delta: "tokens tracked", icon: "Coins", tone: "text-amber-500" },
];

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workflows")
      .then((r) => r.json())
      .then((d) => setWorkflows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workflows"
        description="Design, run, and monitor your agentic automations."
        actions={
          <>
            <Link href="/templates">
              <Button variant="outline" size="md">
                <Icon.Template size={16} /> Templates
              </Button>
            </Link>
            <Link href="/canvas">
              <Button variant="primary" size="md">
                <Icon.Plus size={16} /> New workflow
              </Button>
            </Link>
          </>
        }
      />

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => {
          const IconCmp = Icon[s.icon];
          const value = s.label === "Active workflows" ? String(workflows.length) : s.value;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between">
                <span className={s.tone}>
                  <IconCmp size={18} />
                </span>
                <span className="text-[11px] text-muted-2">{s.delta}</span>
              </div>
              <div className="mt-3 text-[26px] font-semibold tracking-tight text-foreground">
                {value}
              </div>
              <div className="text-[12.5px] text-muted">{s.label}</div>
            </Card>
          );
        })}
      </div>

      {/* AI build banner */}
      <Card className="relative overflow-hidden border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <Badge tone="violet">
              <Icon.Sparkles size={12} /> AI Helper
            </Badge>
            <h2 className="mt-2 text-[18px] font-semibold text-foreground">
              Describe it — the AI builds the workflow
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">
              “Read resumes, score candidates, send approved ones to Slack.” The assistant plans the
              agents, wires the nodes, and drops it on the canvas.
            </p>
          </div>
          <Link href="/canvas">
            <Button variant="primary" size="lg">
              Build with AI <Icon.ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </Card>

      {/* workflow list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-foreground">Recent workflows</h2>
          <span className="text-[12.5px] text-muted-2">{workflows.length} total</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="h-32 animate-pulse bg-surface-muted" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon.Workflow size={22} />
            </div>
            <div>
              <div className="text-[15px] font-medium text-foreground">No workflows yet</div>
              <div className="text-[13px] text-muted">
                Start from scratch or let the AI build one for you.
              </div>
            </div>
            <Link href="/canvas">
              <Button variant="primary" size="md">
                <Icon.Plus size={16} /> Create workflow
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((w) => (
              <Link key={w.id} href={`/canvas?id=${w.id}`}>
                <Card className="group h-full p-5 transition hover:border-violet-200 hover:shadow-md hover:shadow-violet-100">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                      <Icon.Workflow size={18} />
                    </div>
                    <Badge tone="emerald">
                      <Icon.Dot size={8} /> ready
                    </Badge>
                  </div>
                  <div className="mt-4 truncate text-[15px] font-semibold text-foreground">
                    {w.name}
                  </div>
                  <div className="mt-1 text-[12px] text-muted-2">
                    Updated {new Date(w.updatedAt ?? w.createdAt).toLocaleDateString("en-GB")}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[12.5px]">
                    <span className="inline-flex items-center gap-1 text-primary opacity-0 transition group-hover:opacity-100">
                      Open in builder <Icon.ArrowRight size={14} />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
