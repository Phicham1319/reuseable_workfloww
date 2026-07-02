import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "violet" | "emerald" | "amber" | "rose" | "sky" | "fuchsia";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted border-border",
  violet: "bg-violet-100 text-violet-600 border-violet-200/70",
  emerald: "bg-emerald-100 text-emerald-600 border-emerald-200/70",
  amber: "bg-amber-100 text-amber-600 border-amber-200/70",
  rose: "bg-rose-100 text-rose-600 border-rose-200/70",
  sky: "bg-sky-100 text-sky-600 border-sky-200/70",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200/70",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
