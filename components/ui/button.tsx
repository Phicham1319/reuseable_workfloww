import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white shadow-sm shadow-violet-300/40 hover:from-violet-500 hover:to-fuchsia-500",
  secondary: "border border-border bg-surface text-foreground shadow-sm hover:bg-surface-muted",
  ghost: "text-muted hover:bg-surface-muted hover:text-foreground",
  outline: "border border-border text-foreground hover:bg-surface-muted hover:border-border-strong",
  danger: "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-9 gap-2 rounded-xl px-4 text-sm",
  lg: "h-11 gap-2 rounded-xl px-5 text-[15px]",
  icon: "h-9 w-9 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
