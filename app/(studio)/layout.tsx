import type { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "@/components/studio/Sidebar";
import { Icon } from "@/components/ui/icons";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden text-foreground">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/70 px-5 backdrop-blur">
          <div className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-muted shadow-sm">
            <Icon.Search size={16} />
            <input
              placeholder="Search workflows, agents, runs…"
              className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-2"
            />
            <kbd className="ds-kbd">⌘K</kbd>
          </div>
          <div className="flex-1" />
          <Link
            href="/canvas"
            className="flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-[13px] font-medium text-foreground shadow-sm transition hover:bg-surface-muted"
          >
            <Icon.Sparkles size={15} className="text-primary" />
            AI Helper
          </Link>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
