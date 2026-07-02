import PageHeader from "@/components/studio/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";

const INTEGRATIONS = [
  { name: "OpenAI", desc: "GPT-4o, embeddings", connected: true },
  { name: "Slack", desc: "Post messages & alerts", connected: true },
  { name: "Resend", desc: "Transactional email", connected: true },
  { name: "Postgres", desc: "Read & write rows", connected: false },
  { name: "HTTP", desc: "Call any REST API", connected: true },
  { name: "Notion", desc: "Pages & databases", connected: false },
  { name: "GitHub", desc: "Repos & webhooks", connected: false },
  { name: "Webhook", desc: "Inbound triggers", connected: true },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Integrations"
        description="Connect the tools your workflows and agents can act on."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((i) => (
          <Card key={i.name} className="flex items-center gap-4 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted text-muted">
              <Icon.Integrations size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-foreground">{i.name}</div>
              <div className="truncate text-[12.5px] text-muted">{i.desc}</div>
            </div>
            {i.connected ? (
              <Badge tone="emerald">
                <Icon.Check size={11} /> Connected
              </Badge>
            ) : (
              <button className="rounded-lg border border-border px-2.5 py-1 text-[12px] font-medium text-foreground transition hover:bg-surface-muted">
                Connect
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
