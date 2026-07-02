import { Icon } from "@/components/ui/icons";
import { nodeAccent, nodeIconName, nodeImage } from "@/lib/studio/nodeUi";
import { cn } from "@/lib/utils";

/** ไอคอน/ภาพประกอบของ node — ใช้ภาพ line-art ถ้ามี ไม่งั้น fallback เป็น SVG icon */
export function NodeGlyph({
  type,
  size = 36,
  className,
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  const img = nodeImage(type);

  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn(
          "shrink-0 rounded-xl border border-border bg-white object-cover",
          className,
        )}
      />
    );
  }

  const Glyph = Icon[nodeIconName(type)];
  return (
    <span
      style={{ width: size, height: size }}
      className={cn("flex shrink-0 items-center justify-center rounded-xl", nodeAccent(type), className)}
    >
      <Glyph size={Math.round(size * 0.5)} />
    </span>
  );
}
