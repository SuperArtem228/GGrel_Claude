import { cn } from "@/lib/utils";

export function BondMark({
  size = 24,
  color = "currentColor",
  accent,
  className,
}: {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
}) {
  const a = accent || color;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="11" cy="11" r="8" fill={color} />
      <circle
        cx="21"
        cy="11"
        r="8"
        fill={a}
        style={{ mixBlendMode: accent ? "multiply" : "normal" }}
      />
      <circle
        cx="11"
        cy="21"
        r="8"
        fill={a}
        style={{ mixBlendMode: accent ? "multiply" : "normal" }}
      />
      <circle cx="21" cy="21" r="8" fill={color} />
    </svg>
  );
}

export function BondFace({
  size = 56,
  ink = "var(--ink)",
  bg = "var(--accent)",
  className,
}: {
  size?: number;
  ink?: string;
  bg?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center rounded-full shrink-0", className)}
      style={{ width: size, height: size, background: bg, gap: size * 0.12 }}
    >
      <span
        style={{
          width: size * 0.12,
          height: size * 0.22,
          borderRadius: size,
          background: ink,
          display: "block",
        }}
      />
      <span
        style={{
          width: size * 0.12,
          height: size * 0.22,
          borderRadius: size,
          background: ink,
          display: "block",
        }}
      />
    </div>
  );
}

export function Coin({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={cn("shrink-0", className)}
    >
      <circle cx="8" cy="8" r="7" fill="var(--accent)" stroke="var(--accent-ink)" strokeWidth="1.4" />
      <path
        d="M6 5.5 L6 10.5 M6 5.5 L9 5.5 C9.8 5.5 10.5 6.2 10.5 7 C10.5 7.8 9.8 8.5 9 8.5 L6 8.5 M8 8.5 L10.5 10.5"
        stroke="var(--accent-ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
