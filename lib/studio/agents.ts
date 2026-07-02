import type { IconName } from "@/components/ui/icons";

export type AgentStatus = "idle" | "running" | "done" | "waiting" | "failed";

export type Agent = {
  id: string;
  role: string;
  name: string;
  icon: IconName;
  /** tailwind color stem e.g. "violet" */
  color: string;
  status: AgentStatus;
  goal: string;
  model: string;
  confidence: number;
  tokens: number;
  cost: number;
  tools: string[];
  knowledge: string[];
  memory: string;
  prompt: string;
  reasoning: { t: string; text: string }[];
};

/**
 * Reference agent pipeline — the "agentic" mental model of the platform.
 * Planner → Research → Decision → Execution → Reviewer → Output.
 * (Design surface: shape mirrors what a live agent run will populate.)
 */
export const AGENTS: Agent[] = [
  {
    id: "planner",
    role: "Planner",
    name: "Planner Agent",
    icon: "Brain",
    color: "violet",
    status: "done",
    goal: "Break the user request into an ordered, executable plan.",
    model: "gpt-4o",
    confidence: 0.94,
    tokens: 1820,
    cost: 0.021,
    tools: ["decompose", "estimate"],
    knowledge: ["Workflow patterns"],
    memory: "Remembers the original objective and constraints across the run.",
    prompt: "You are a planning agent. Decompose the goal into concrete, verifiable steps…",
    reasoning: [
      { t: "00:00.2", text: "Parsed goal: score resumes → route approved to Slack." },
      { t: "00:00.8", text: "Chose 5-stage plan; flagged scoring as decision point." },
    ],
  },
  {
    id: "research",
    role: "Research",
    name: "Research Agent",
    icon: "Search2",
    color: "sky",
    status: "done",
    goal: "Gather the context and knowledge each step needs.",
    model: "gpt-4o-mini",
    confidence: 0.88,
    tokens: 3140,
    cost: 0.014,
    tools: ["knowledge.retrieve", "http.get"],
    knowledge: ["Job description.pdf", "Scoring rubric.md"],
    memory: "Caches retrieved passages for downstream agents.",
    prompt: "Retrieve only the passages relevant to the current step. Cite sources.",
    reasoning: [
      { t: "00:01.1", text: "Retrieved 4 chunks from Scoring rubric.md (score 0.82)." },
      { t: "00:01.9", text: "No web lookup needed — rubric is self-contained." },
    ],
  },
  {
    id: "decision",
    role: "Decision",
    name: "Decision Agent",
    icon: "Scale",
    color: "fuchsia",
    status: "running",
    goal: "Score each candidate and decide approve / reject.",
    model: "gpt-4o",
    confidence: 0.79,
    tokens: 2260,
    cost: 0.026,
    tools: ["ai.instruct", "if.branch"],
    knowledge: ["Scoring rubric.md"],
    memory: "Tracks threshold and per-candidate rationale.",
    prompt: "Score the candidate 0–100 against the rubric. Approve if ≥ 70.",
    reasoning: [
      { t: "00:02.4", text: "Candidate #3 scored 74 → approve (confidence 0.79)." },
      { t: "00:02.7", text: "Low confidence on ambiguous experience — will flag for review." },
    ],
  },
  {
    id: "execution",
    role: "Execution",
    name: "Execution Agent",
    icon: "Bolt",
    color: "amber",
    status: "waiting",
    goal: "Carry out side effects: post to Slack, send email.",
    model: "gpt-4o-mini",
    confidence: 0.9,
    tokens: 640,
    cost: 0.003,
    tools: ["slack.post", "email.send", "retry"],
    knowledge: [],
    memory: "Idempotency keys to avoid duplicate sends on retry.",
    prompt: "Execute the approved actions. Retry transient failures up to 3×.",
    reasoning: [{ t: "—", text: "Waiting for Decision Agent to finish scoring." }],
  },
  {
    id: "reviewer",
    role: "Reviewer",
    name: "Reviewer Agent",
    icon: "Eye",
    color: "emerald",
    status: "idle",
    goal: "Verify outputs, catch regressions, request clarification.",
    model: "gpt-4o",
    confidence: 0.85,
    tokens: 0,
    cost: 0,
    tools: ["validate", "human.approval"],
    knowledge: ["Quality checklist.md"],
    memory: "Learns from prior corrections to tighten future checks.",
    prompt: "Review the run against the checklist. Escalate to a human if unsure.",
    reasoning: [{ t: "—", text: "Not started." }],
  },
];

export const STATUS_META: Record<AgentStatus, { label: string; tone: string; dot: string }> = {
  idle: { label: "Idle", tone: "text-muted-2", dot: "bg-slate-300" },
  running: { label: "Running", tone: "text-sky-600", dot: "bg-sky-400 animate-pulse" },
  done: { label: "Done", tone: "text-emerald-600", dot: "bg-emerald-400" },
  waiting: { label: "Waiting", tone: "text-amber-600", dot: "bg-amber-400" },
  failed: { label: "Failed", tone: "text-rose-600", dot: "bg-rose-400" },
};
