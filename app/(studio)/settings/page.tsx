import PageHeader from "@/components/studio/PageHeader";
import { Card, CardBody, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Workspace, models, and secrets." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* workspace */}
        <Card>
          <CardBody>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>General workspace configuration.</CardDescription>
            <div className="mt-4 space-y-3">
              <Row label="Name" value="Pichamon's workspace" />
              <Row label="Plan" value={<Badge tone="emerald">Pro</Badge>} />
              <Row label="Region" value="ap-southeast-1" />
            </div>
          </CardBody>
        </Card>

        {/* default model */}
        <Card>
          <CardBody>
            <CardTitle>Default model</CardTitle>
            <CardDescription>Used by AI nodes and agents unless overridden.</CardDescription>
            <div className="mt-4 space-y-3">
              <Row
                label="Model"
                value={
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[13px] text-foreground">
                    <Icon.Sparkles size={14} className="text-primary" /> gpt-4o-mini
                  </span>
                }
              />
              <Row label="Temperature" value="0.7" />
              <Row label="Max tokens" value="2048" />
            </div>
          </CardBody>
        </Card>

        {/* secrets */}
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Secrets & API keys</CardTitle>
                <CardDescription>Encrypted at rest. Referenced by name in nodes.</CardDescription>
              </div>
              <Badge tone="amber">
                <Icon.Bolt size={11} /> Sensitive
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              {["OPENAI_API_KEY", "RESEND_API_KEY", "SLACK_WEBHOOK_URL"].map((k) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-2.5"
                >
                  <span className="font-mono text-[12.5px] text-muted">{k}</span>
                  <span className="font-mono text-[12.5px] text-muted-2">••••••••••</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}
