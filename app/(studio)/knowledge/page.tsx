import PageHeader from "@/components/studio/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";

const SOURCES = [
  { name: "PDF", desc: "Contracts, resumes, reports", tone: "rose" as const },
  { name: "DOCX", desc: "Word documents", tone: "sky" as const },
  { name: "Markdown", desc: "Docs & rubrics", tone: "violet" as const },
  { name: "Website", desc: "Crawl & index pages", tone: "emerald" as const },
  { name: "Notion", desc: "Pages & databases", tone: "neutral" as const },
  { name: "GitHub", desc: "Repos, issues, wikis", tone: "neutral" as const },
  { name: "Database", desc: "Postgres, MySQL", tone: "amber" as const },
  { name: "API", desc: "Any REST endpoint", tone: "sky" as const },
];

export default function KnowledgePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge"
        description="Connect sources so agents can retrieve context before deciding — with transparent citations."
        actions={
          <Button variant="primary" size="md">
            <Icon.Plus size={16} /> Connect source
          </Button>
        }
      />

      <Card className="flex flex-wrap items-center gap-3 border-violet-200 bg-violet-50 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Icon.Brain size={18} />
        </span>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-foreground">Retrieval-augmented agents</div>
          <div className="text-[13px] text-muted">
            Agents pull the most relevant passages at decision time and show you exactly what they used.
          </div>
        </div>
        <Badge tone="violet">RAG</Badge>
      </Card>

      <div>
        <div className="mb-3 text-[13px] font-semibold text-foreground">Source types</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SOURCES.map((s) => (
            <Card key={s.name} className="group flex flex-col gap-2 p-4 transition hover:border-border-strong hover:bg-surface-muted">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted">
                  <Icon.Knowledge size={16} />
                </span>
                <Badge tone={s.tone}>{s.name}</Badge>
              </div>
              <div className="text-[13px] text-muted">{s.desc}</div>
              <button className="mt-1 flex items-center gap-1 text-[12px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Connect <Icon.ArrowRight size={13} />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
