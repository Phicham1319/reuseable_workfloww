import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & {
  size?: number;
  strokeWidth?: number;
};

function base({ size = 18, strokeWidth = 1.8, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const Icon = {
  Workflow: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="15" width="6" height="6" rx="1.5" />
      <path d="M9 6h4a2 2 0 0 1 2 2v10" />
    </svg>
  ),
  Template: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Agent: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="4" y="7" width="16" height="11" rx="3" />
      <path d="M12 7V4M9 12h.01M15 12h.01M8 18v2M16 18v2" />
    </svg>
  ),
  Knowledge: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 5v14" />
    </svg>
  ),
  Integrations: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M9 3v4M15 3v4M8 7h8a1 1 0 0 1 1 1v4a5 5 0 0 1-10 0V8a1 1 0 0 1 1-1zM12 17v4" />
    </svg>
  ),
  History: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 4v4h4M12 8v4l3 2" />
    </svg>
  ),
  Settings: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  Sparkles: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5 10.1 7.6z" />
      <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </svg>
  ),
  Plus: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Search: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Play: (p: IconProps) => (
    <svg {...base({ ...p })} fill="currentColor" stroke="none">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  ),
  Check: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Bolt: (p: IconProps) => (
    <svg {...base({ ...p })} fill="currentColor" stroke="none">
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  ),
  Brain: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5 1V5a3 3 0 0 0-2-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5 1" />
    </svg>
  ),
  Search2: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  Scale: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 3v18M7 21h10M6 7l-3 6a3 3 0 0 0 6 0zM18 7l3 6a3 3 0 0 1-6 0zM6 7l6-1 6 1" />
    </svg>
  ),
  Gauge: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 15a3 3 0 1 0 0-6M15.5 10.5 19 7M4 20a9 9 0 1 1 16 0" />
    </svg>
  ),
  Eye: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Layers: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="m12 3 9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />
    </svg>
  ),
  Coins: (p: IconProps) => (
    <svg {...base(p)}>
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path d="M3 7v5c0 1.7 2.7 3 6 3M3 12v5c0 1.7 2.7 3 6 3" />
      <ellipse cx="15" cy="14" rx="6" ry="3" />
      <path d="M21 14v3c0 1.7-2.7 3-6 3" />
    </svg>
  ),
  ArrowRight: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Dot: (p: IconProps) => (
    <svg {...base({ ...p })} fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  Wrench: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M15.5 5.5a4 4 0 0 0-5.3 5.1L4 16.8V20h3.2l6.2-6.2a4 4 0 0 0 5.1-5.3l-2.6 2.6-2.5-.3-.3-2.5z" />
    </svg>
  ),
  Branch: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 12h3.5a2 2 0 0 0 1.6-.8L15 7.6M7 12h3.5a2 2 0 0 1 1.6.8L15 16.4" />
    </svg>
  ),
  Globe: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" />
    </svg>
  ),
  Mail: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </svg>
  ),
  Copy: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  ),
  Trash: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 7h16M10 4h4M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
    </svg>
  ),
  Expand: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 0-1 1h-4" />
    </svg>
  ),
  Dots: (p: IconProps) => (
    <svg {...base({ ...p })} fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  ),
};

export type IconName = keyof typeof Icon;
