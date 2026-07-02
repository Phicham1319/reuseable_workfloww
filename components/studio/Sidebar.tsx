"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: IconName; badge?: string };

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Build",
    items: [
      { label: "Workflows", href: "/dashboard", icon: "Workflow" },
      { label: "Templates", href: "/templates", icon: "Template" },
      { label: "AI Agents", href: "/agents", icon: "Agent", badge: "New" },
    ],
  },
  {
    section: "Data",
    items: [
      { label: "Knowledge", href: "/knowledge", icon: "Knowledge" },
      { label: "Integrations", href: "/integrations", icon: "Integrations" },
    ],
  },
  {
    section: "Operate",
    items: [
      { label: "History", href: "/history", icon: "History" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-border bg-surface/70 backdrop-blur-xl">
      {/* brand / workspace */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="ds-brand h-9 w-9">
          <Icon.Sparkles size={18} className="text-white" />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[14px] font-semibold text-foreground">Fluxion</div>
          <div className="truncate text-[11px] text-muted-2">Agentic Workflows</div>
        </div>
      </div>

      {/* new workflow */}
      <div className="px-3 pb-2">
        <Link href="/canvas" className="ds-btn-primary h-10 w-full text-[13.5px]">
          <Icon.Plus size={16} /> New workflow
        </Link>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
              {group.section}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const IconCmp = Icon[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition",
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-muted hover:bg-surface-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "transition",
                        active ? "text-primary" : "text-muted-2 group-hover:text-muted",
                      )}
                    >
                      <IconCmp size={18} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">
                        {item.badge}
                      </span>
                    )}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* account */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-fuchsia-200 text-[12px] font-semibold text-violet-700">
            PJ
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[12.5px] font-medium text-foreground">Pichamon</div>
            <div className="truncate text-[11px] text-muted-2">Pro workspace</div>
          </div>
          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
            Pro
          </span>
        </div>
      </div>
    </aside>
  );
}
