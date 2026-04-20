"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, Trophy, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", icon: Home, label: "Главная" },
  { href: "/tasks", icon: ListTodo, label: "Задачи" },
  { href: "/challenges", icon: Trophy, label: "Челленджи" },
  { href: "/shop", icon: ShoppingBag, label: "Магазин" },
  { href: "/profile", icon: User, label: "Профиль" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="hairline-t flex items-stretch justify-around bg-surface/90 pb-safe backdrop-blur-md"
      style={{ paddingTop: 10, paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}
    >
      {items.map((it) => {
        const active = pathname === it.href || pathname?.startsWith(it.href + "/");
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-muted",
              active && "text-ink",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-md px-3 py-1 transition-colors",
                active && "bg-accent-soft",
              )}
            >
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span className="text-[10px] font-medium">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
