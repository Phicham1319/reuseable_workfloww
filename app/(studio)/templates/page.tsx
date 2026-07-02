import Link from "next/link";
import PageHeader from "@/components/studio/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";

const TEMPLATES = [
  {
    name: "Resume screening",
    desc: "Read resumes, score against a rubric, send approved candidates to Slack.",
    tags: ["AI", "Slack", "If"],
    tone: "violet" as const,
  },
  {
    name: "Lead enrichment",
    desc: "Enrich inbound leads via HTTP, summarize, and store in your database.",
    tags: ["HTTP", "AI", "DB"],
    tone: "sky" as const,
  },
  {
    name: "Support triage",
    desc: "Classify tickets, route by priority, draft a first response.",
    tags: ["AI", "Branch", "Email"],
    tone: "fuchsia" as const,
  },
  {
    name: "Daily digest",
    desc: "Scheduled fetch, AI summary, email to the team every morning.",
    tags: ["Cron", "AI", "Email"],
    tone: "amber" as const,
  },
  {
    name: "Content pipeline",
    desc: "Research → draft → review with a multi-agent chain.",
    tags: ["Agents", "AI"],
    tone: "emerald" as const,
  },
  {
    name: "Webhook to Slack",
    desc: "Receive a webhook, transform the payload, post to a channel.",
    tags: ["Webhook", "Slack"],
    tone: "sky" as const,
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Templates"
        description="Production-ready starting points. Fork one and customize on the canvas."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Card key={t.name} className="group flex flex-col p-5 transition hover:border-violet-200 hover:shadow-md hover:shadow-violet-100">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                <Icon.Template size={18} />
              </span>
              <div className="flex gap-1">
                {t.tags.map((tag) => (
                  <Badge key={tag} tone={t.tone}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-4 text-[15px] font-semibold text-foreground">{t.name}</div>
            <p className="mt-1 flex-1 text-[13px] leading-5 text-muted">{t.desc}</p>
            <Link href="/canvas" className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Use template <Icon.ArrowRight size={14} />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
