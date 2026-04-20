import Link from "next/link";
import { Coin } from "./bond-mark";
import { Pill } from "./ui/pill";
import { cn, formatLC } from "@/lib/utils";

export function CaseCard({
  id,
  title,
  description,
  openPriceLc,
  emoji,
  itemsCount,
  isSpicy,
  className,
}: {
  id: string;
  title: string;
  description?: string | null;
  openPriceLc: number;
  emoji?: string | null;
  itemsCount: number;
  isSpicy?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={isSpicy ? `/spicy/cases/${id}` : `/shop/cases/${id}`}
      className={cn(
        "relative block overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-surface p-4 shadow-card transition hover:shadow-lift",
        className,
      )}
    >
      <div
        className="absolute -right-6 -top-6 h-28 w-28 rounded-full"
        style={{
          background: isSpicy ? "var(--accent)" : "var(--accent)",
          filter: "blur(36px)",
          opacity: 0.55,
        }}
      />
      <div className="relative z-10 flex items-start gap-3">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-[30px]",
            isSpicy ? "bg-magenta-soft" : "bg-accent-soft",
          )}
        >
          {emoji || "🎁"}
        </div>
        <div className="min-w-0 flex-1">
          <Pill variant={isSpicy ? "magenta-soft" : "accent-soft"} size="sm">
            {itemsCount} наград · кейс
          </Pill>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-tight">{title}</h3>
          {description ? <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">{description}</p> : null}
        </div>
      </div>
      <div className="relative z-10 mt-3 flex items-center justify-between border-t border-[color:var(--hairline)] pt-3">
        <div className="text-[11px] text-muted">Открыть за</div>
        <div className="flex items-center gap-1 text-[15px] font-semibold">
          <Coin size={12} />
          {formatLC(openPriceLc)} LC
        </div>
      </div>
    </Link>
  );
}
