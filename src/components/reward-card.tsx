import { Coin } from "./bond-mark";
import { Pill } from "./ui/pill";
import { formatLC, cn } from "@/lib/utils";
import type { RewardCategory } from "@prisma/client";

export function RewardCard({
  title,
  description,
  priceLc,
  category,
  emoji,
  isSpicy,
  locked,
  onClick,
  className,
}: {
  title: string;
  description?: string | null;
  priceLc: number;
  category: RewardCategory;
  emoji?: string | null;
  isSpicy?: boolean;
  locked?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border border-[color:var(--hairline)] bg-surface p-3.5 text-left shadow-hair transition hover:shadow-card",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-[28px]",
          isSpicy ? "bg-magenta-soft" : "bg-accent-soft",
        )}
      >
        {locked ? "🔒" : emoji || (isSpicy ? "🌙" : "🎁")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1">
          <Pill variant={category === "INSTANT" ? "accent-soft" : isSpicy ? "magenta-soft" : "muted"} size="sm">
            {category === "ACTION" ? "Действие" : category === "INSTANT" ? "Мгновенно" : "Приватно"}
          </Pill>
        </div>
        <h3 className="mt-1 line-clamp-1 text-[14px] font-semibold tracking-tight">{title}</h3>
        {description ? <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">{description}</p> : null}
      </div>
      <div className="flex items-center gap-1 text-[15px] font-semibold">
        <Coin size={12} />
        {formatLC(priceLc)}
      </div>
    </Tag>
  );
}
