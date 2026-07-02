"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { NODE_IMAGE } from "@/lib/studio/nodeUi";
import { NodeGlyph } from "@/components/studio/NodeGlyph";
import { cn } from "@/lib/utils";

/* token groups (var names live in globals.css :root) */
const CHROME = [
  { name: "background", var: "--background" },
  { name: "surface", var: "--surface" },
  { name: "surface-2", var: "--surface-2" },
  { name: "surface-muted", var: "--surface-muted" },
  { name: "border", var: "--border" },
  { name: "border-strong", var: "--border-strong" },
];
const TEXT = [
  { name: "foreground", var: "--foreground" },
  { name: "muted", var: "--muted" },
  { name: "muted-2", var: "--muted-2" },
];
const BRAND = [
  { name: "primary", var: "--primary" },
  { name: "primary-hover", var: "--primary-hover" },
  { name: "primary-soft", var: "--primary-soft" },
  { name: "accent", var: "--accent" },
];
const STATUS = [
  { name: "success", var: "--success" },
  { name: "warning", var: "--warning" },
  { name: "danger", var: "--danger" },
  { name: "info", var: "--info" },
];

const BADGE_TONES = ["neutral", "violet", "sky", "emerald", "amber", "rose", "fuchsia"] as const;

const SECTIONS = [
  ["colors", "Colors"],
  ["typography", "Typography"],
  ["buttons", "Buttons"],
  ["forms", "Forms"],
  ["cards", "Cards"],
  ["badges", "Badges & bits"],
  ["nodes", "Node icons"],
] as const;

export default function DesignSystemPage() {
  const [temp, setTemp] = useState(0.7);
  const pct = temp * 100;

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3.5">
          <div className="ds-brand h-9 w-9">
            <Icon.Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-foreground">Fluxion Design System</div>
            <div className="text-[11.5px] text-muted-2">Pastel light · global CSS tokens</div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Icon.ArrowRight size={14} /> Back to app
            </Button>
          </Link>
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-1.5 px-6 pb-3">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="ds-chip hover:border-violet-200 hover:text-violet-600">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl space-y-14 px-6 py-10">
        {/* ── COLORS ── */}
        <Section id="colors" title="Colors" desc="Semantic tokens defined once in globals.css :root and mapped to Tailwind via @theme.">
          <TokenGrid title="Chrome" tokens={CHROME} bordered />
          <TokenGrid title="Text" tokens={TEXT} swatchText />
          <TokenGrid title="Brand" tokens={BRAND} />
          <TokenGrid title="Status" tokens={STATUS} />
        </Section>

        {/* ── TYPOGRAPHY ── */}
        <Section id="typography" title="Typography" desc="Geist Sans for UI, Geist Mono for code/values.">
          <Card>
            <CardBody className="space-y-4">
              <Row label="Display / 26px semibold">
                <div className="text-[26px] font-semibold tracking-tight text-foreground">
                  Build agentic workflows
                </div>
              </Row>
              <Row label="Heading / 18px semibold">
                <div className="text-[18px] font-semibold text-foreground">Section heading</div>
              </Row>
              <Row label="Body / 14px">
                <p className="text-[14px] leading-6 text-foreground">
                  The quick brown fox jumps over the lazy dog. Describe it and the AI builds it.
                </p>
              </Row>
              <Row label="Muted / 13px">
                <p className="text-[13px] text-muted">Secondary supporting copy sits at muted.</p>
              </Row>
              <Row label="Section title / 10px uppercase">
                <div className="ds-section-title">Quick actions</div>
              </Row>
              <Row label="Mono / 12px">
                <code className="font-mono text-[12px] text-muted">
                  {"{{node.output.field}}"}
                </code>
              </Row>
            </CardBody>
          </Card>
        </Section>

        {/* ── BUTTONS ── */}
        <Section id="buttons" title="Buttons" desc="Component: components/ui/button.tsx · Global classes: .ds-btn-*">
          <Card>
            <CardBody className="space-y-6">
              <div>
                <div className="ds-section-title mb-3">Variants</div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">
                    <Icon.Sparkles size={15} /> Primary
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Delete</Button>
                </div>
              </div>
              <div>
                <div className="ds-section-title mb-3">Sizes</div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                  <Button variant="secondary" size="icon">
                    <Icon.Plus size={16} />
                  </Button>
                </div>
              </div>
              <div>
                <div className="ds-section-title mb-3">Global class (raw HTML)</div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="ds-btn-primary">.ds-btn-primary</button>
                  <button className="ds-btn-secondary">.ds-btn-secondary</button>
                  <button className="ds-btn-ghost">.ds-btn-ghost</button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* ── FORMS ── */}
        <Section id="forms" title="Forms" desc="Global class: .ds-input / .ds-input-mono">
          <Card>
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="ds-label">Text input</span>
                <input className="ds-input" placeholder="Type something…" />
              </label>
              <label className="block">
                <span className="ds-label">Select</span>
                <select className="ds-input" defaultValue="">
                  <option value="">Choose…</option>
                  <option>Option A</option>
                  <option>Option B</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="ds-label">Textarea (mono)</span>
                <textarea rows={3} className="ds-input-mono text-[12px]" defaultValue={`{\n  "key": "value"\n}`} />
              </label>
              <label className="block sm:col-span-2">
                <span className="ds-label flex items-center justify-between">
                  <span>Slider — temperature</span>
                  <span className="ds-kbd font-mono">{temp.toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-violet-500"
                  style={{
                    background: `linear-gradient(to right, #a78bfa 0%, #e0aaf5 ${pct}%, #ece8f6 ${pct}%, #ece8f6 100%)`,
                  }}
                />
                <div className="mt-1.5 flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted-2">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </label>
            </CardBody>
          </Card>
        </Section>

        {/* ── CARDS ── */}
        <Section id="cards" title="Cards & panels" desc="Component: components/ui/card.tsx · Global class: .ds-panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardBody>
                <div className="ds-brand mb-3 h-10 w-10">
                  <Icon.Workflow size={18} className="text-white" />
                </div>
                <CardTitle>Card component</CardTitle>
                <CardDescription>Using &lt;Card&gt; + &lt;CardBody&gt; primitives.</CardDescription>
              </CardBody>
            </Card>
            <div className="ds-panel p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon.Layers size={18} />
              </div>
              <div className="text-[15px] font-semibold text-foreground">.ds-panel</div>
              <p className="mt-1 text-[13px] text-muted">Raw HTML with the global panel class.</p>
            </div>
            <div className="ds-panel-muted p-5">
              <div className="text-[15px] font-semibold text-foreground">.ds-panel-muted</div>
              <p className="mt-1 text-[13px] text-muted">Inset / secondary surface.</p>
            </div>
          </div>
        </Section>

        {/* ── BADGES & BITS ── */}
        <Section id="badges" title="Badges & bits" desc="Component: Badge · Global: .ds-chip / .ds-kbd">
          <Card>
            <CardBody className="space-y-6">
              <div>
                <div className="ds-section-title mb-3">Badge tones</div>
                <div className="flex flex-wrap gap-2">
                  {BADGE_TONES.map((t) => (
                    <Badge key={t} tone={t}>
                      <Icon.Dot size={8} /> {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="ds-section-title mb-3">Chips</div>
                <div className="flex flex-wrap gap-2">
                  <span className="ds-chip">Neutral chip</span>
                  <span className="ds-chip hover:border-violet-200 hover:text-violet-600">
                    <Icon.Sparkles size={11} className="text-primary" /> Hoverable
                  </span>
                </div>
              </div>
              <div>
                <div className="ds-section-title mb-3">Keyboard</div>
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                  Press <kbd className="ds-kbd">/</kbd> to add · <kbd className="ds-kbd">⌘K</kbd> to search · <kbd className="ds-kbd">esc</kbd> to close
                </div>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* ── NODE ICONS ── */}
        <Section id="nodes" title="Node icons" desc="Cute line-art illustrations in /public/nodes — shared across canvas & node picker.">
          <Card>
            <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.keys(NODE_IMAGE).map((type) => (
                <div key={type} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                  <NodeGlyph type={type} size={44} />
                  <span className="font-mono text-[12.5px] text-foreground">{type}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </Section>

        <footer className="border-t border-border pt-6 text-center text-[12px] text-muted-2">
          Edit tokens in <code className="font-mono text-muted">app/globals.css</code> · everything here updates automatically.
        </footer>
      </main>
    </div>
  );
}

function Section({
  id,
  title,
  desc,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-[13.5px] text-muted">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function TokenGrid({
  title,
  tokens,
  bordered,
  swatchText,
}: {
  title: string;
  tokens: { name: string; var: string }[];
  bordered?: boolean;
  swatchText?: boolean;
}) {
  return (
    <div>
      <div className="ds-section-title mb-2">{title}</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tokens.map((t) => (
          <div key={t.var} className="ds-panel overflow-hidden">
            <div
              className={cn(
                "flex h-16 items-center justify-center",
                bordered && "border-b border-border",
                swatchText && "border-b border-border",
              )}
              style={{ background: swatchText ? "var(--surface-2)" : `var(${t.var})` }}
            >
              {swatchText && (
                <span className="text-[17px] font-semibold" style={{ color: `var(${t.var})` }}>
                  Aa
                </span>
              )}
            </div>
            <div className="px-3 py-2">
              <div className="text-[12.5px] font-medium text-foreground">{t.name}</div>
              <div className="font-mono text-[10.5px] text-muted-2">{t.var}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border pb-4 last:border-0 last:pb-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="pt-1 font-mono text-[11px] text-muted-2">{label}</div>
      <div>{children}</div>
    </div>
  );
}
