"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

const items = [
  { key: "incoming", label: "Входящие" },
  { key: "outgoing", label: "Отправленные" },
  { key: "archive", label: "Архив" },
];

export function TasksTabs({ current }: { current: string }) {
  return (
    <div className="no-scrollbar hairline-b flex items-center gap-1 overflow-x-auto px-5 pb-2">
      {items.map((it) => {
        const active = current === it.key;
        return (
          <Link
            key={it.key}
            href={`/tasks?tab=${it.key}`}
            className={cn(
              "rounded-pill px-3 py-1.5 text-[12px] font-medium transition",
              active ? "bg-ink text-white" : "bg-surface-alt text-muted hover:text-ink",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
