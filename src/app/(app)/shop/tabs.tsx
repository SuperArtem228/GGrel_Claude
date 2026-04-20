"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ShopTabs({ active }: { active: "rewards" | "cases" }) {
  return (
    <div
      role="tablist"
      className="inline-flex rounded-pill border border-[color:var(--hairline)] bg-surface p-1 text-[13px]"
    >
      <Link
        href="/shop?tab=rewards"
        className={cn(
          "min-w-[92px] rounded-pill px-4 py-1.5 text-center transition",
          active === "rewards" ? "bg-ink text-white" : "text-muted hover:text-ink",
        )}
      >
        Награды
      </Link>
      <Link
        href="/shop?tab=cases"
        className={cn(
          "min-w-[92px] rounded-pill px-4 py-1.5 text-center transition",
          active === "cases" ? "bg-ink text-white" : "text-muted hover:text-ink",
        )}
      >
        Кейсы
      </Link>
    </div>
  );
}
