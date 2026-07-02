"use client";

import { useState } from "react";
import PageHeader from "@/components/studio/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { AGENTS, STATUS_META, type Agent } from "@/lib/studio/agents";
import { cn } from "@/lib/utils";

// literal classes so Tailwind v4 compiles them (no dynamic interpolation)
const AGENT_COLOR: Record<string, string> = {
  violet: "bg-violet-100 text-violet-600",
  sky: "bg-sky-100 text-sky-600",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
};
const agentColor = (c: string) => AGENT_COLOR[c] ?? AGENT_COLOR.violet;

export default function AgentsPage() {
  const [selectedId, setSelectedId] = useState<string>(AGENTS[2].id);
  const selected = AGENTS.find((a) => a.id === selectedId)!;

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Agents"
        description="A team of specialized agents that plan, reason, decide, and act — with full observability."
        actions={
          <Button variant="primary" size="md">
            <Icon.Plus size={16} /> New agent
          </Button>
        }
      />

      {/* pipeline */}
      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <Icon.Layers size={16} className="text-primary" /> Agent pipeline
          </div>
          <Badge tone="sky">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> live run
          </Badge>
        </div>

        <div className="flex flex-wrap items-stretch gap-2">
          {AGENTS.map((a, i) => (
            <div key={a.id} className="flex items-stretch gap-2">
              <AgentPill
                agent={a}
                active={a.id === selectedId}
                onClick={() => setSelectedId(a.id)}
              />
              {i < AGENTS.length - 1 && (
                <div className="flex items-center text-muted-2">
                  <Icon.ArrowRight size={18} />
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-muted-2">
              <Icon.ArrowRight size={18} />
            </div>
            <div className="flex items-center rounded-2xl border border-dashed border-border-strong px-4 text-[12.5px] font-medium text-muted">
              Final Output
            </div>
          </div>
        </div>
      </Card>

      {/* detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <AgentDetail agent={selected} />
        <ReasoningPanel agent={selected} />
      </div>
    </div>
  );
}

function AgentPill({
  agent,
  active,
  onClick,
}: {
  agent: Agent;
  active: boolean;
  onClick: () => void;
}) {
  const IconCmp = Icon[agent.icon];
  const st = STATUS_META[agent.status];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-[150px] flex-col gap-2 rounded-2xl border p-3 text-left transition",
        active
          ? "border-violet-300 bg-violet-50 shadow-sm shadow-violet-200/50"
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            agentColor(agent.color),
          )}
        >
          <IconCmp size={18} />
        </span>
        <span className={cn("h-2 w-2 rounded-full", st.dot)} />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-foreground">{agent.role}</div>
        <div className={cn("text-[11px]", st.tone)}>{st.label}</div>
      </div>
    </button>
  );
}

function AgentDetail({ agent }: { agent: Agent }) {
  const IconCmp = Icon[agent.icon];
  const st = STATUS_META[agent.status];
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            agentColor(agent.color),
          )}
        >
          <IconCmp size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-semibold text-foreground">{agent.name}</h2>
            <Badge tone={agent.status === "running" ? "sky" : agent.status === "done" ? "emerald" : "neutral"}>
              <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} /> {st.label}
            </Badge>
          </div>
          <p className="mt-1 text-[13.5px] text-muted">{agent.goal}</p>
        </div>
      </div>

      {/* metrics */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric label="Confidence" value={`${Math.round(agent.confidence * 100)}%`} icon="Gauge" />
        <Metric label="Tokens" value={agent.tokens.toLocaleString()} icon="Bolt" />
        <Metric label="Cost" value={`$${agent.cost.toFixed(3)}`} icon="Coins" />
      </div>

      <Field label="Model">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[13px] text-foreground">
          <Icon.Sparkles size={14} className="text-primary" /> {agent.model}
        </div>
      </Field>

      <Field label="System prompt">
        <div className="rounded-xl border border-border bg-surface-muted p-3 font-mono text-[12px] leading-5 text-muted">
          {agent.prompt}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tools">
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.length ? (
              agent.tools.map((t) => (
                <Badge key={t} tone="violet">
                  {t}
                </Badge>
              ))
            ) : (
              <span className="text-[12.5px] text-muted-2">No tools</span>
            )}
          </div>
        </Field>
        <Field label="Knowledge">
          <div className="flex flex-wrap gap-1.5">
            {agent.knowledge.length ? (
              agent.knowledge.map((k) => (
                <Badge key={k} tone="sky">
                  <Icon.Knowledge size={11} /> {k}
                </Badge>
              ))
            ) : (
              <span className="text-[12.5px] text-muted-2">None attached</span>
            )}
          </div>
        </Field>
      </div>

      <Field label="Memory">
        <p className="text-[13px] leading-5 text-muted">{agent.memory}</p>
      </Field>
    </Card>
  );
}

function ReasoningPanel({ agent }: { agent: Agent }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <Icon.Brain size={16} className="text-fuchsia-500" /> Reasoning log
      </div>
      <div className="relative space-y-4 pl-4">
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border-strong" />
        {agent.reasoning.map((r, i) => (
          <div key={i} className="relative">
            <span className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full bg-violet-400 ring-4 ring-violet-100" />
            <div className="text-[11px] font-mono text-muted-2">{r.t}</div>
            <div className="text-[13px] leading-5 text-muted">{r.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-border bg-surface-muted p-3 text-[12px] leading-5 text-muted">
        Agents can <span className="text-foreground">retry</span> on failure and{" "}
        <span className="text-foreground">ask for clarification</span> when confidence is low.
      </div>
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: "Gauge" | "Bolt" | "Coins" }) {
  const IconCmp = Icon[icon];
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-2">
        <IconCmp size={13} /> {label}
      </div>
      <div className="mt-1 text-[18px] font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {label}
      </div>
      {children}
    </div>
  );
}
