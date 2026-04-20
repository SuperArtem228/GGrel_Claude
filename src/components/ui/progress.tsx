import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
  tone = "ink",
  height = 8,
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "ink" | "accent" | "success" | "magenta";
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    tone === "accent"
      ? "var(--accent)"
      : tone === "success"
        ? "var(--success)"
        : tone === "magenta"
          ? "#E5199F"
          : "var(--ink)";
  return (
    <div
      className={cn("relative overflow-hidden rounded-pill", className)}
      style={{ height, background: "var(--bg-deep)" }}
    >
      <div
        className="h-full transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%`, background: fill, borderRadius: 999 }}
      />
    </div>
  );
}
