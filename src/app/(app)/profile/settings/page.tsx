import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Pill } from "@/components/ui/pill";
import { ChevronRight } from "lucide-react";
import { SignOutButton } from "./signout";
import { PushToggle } from "./push";
import { PwaInstaller } from "@/components/pwa-installer";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, pair } = await requirePair();
  const subs = await prisma.pushSubscription.count({ where: { userId: user.id } });

  return (
    <>
      <TopHeader title="Настройки" backHref="/profile" />
      <MobileScroll>
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-wide text-muted">Аккаунт</div>
          <div className="mt-2">
            <div className="text-[16px] font-semibold">{user.displayName}</div>
            <div className="text-[12px] text-muted">{user.email}</div>
          </div>
        </div>

        <div className="mt-4 card divide-y divide-[color:var(--hairline)]">
          <Row title="Часовой пояс" sub={pair.timezone} />
          <Row title="Приватный режим" sub={pair.spicyEnabled ? "Включён" : "Выключен"} href="/spicy/settings" />
          <Row title="Биржа задач" sub="Настройки публикации задач" href="/tasks/exchange" />
        </div>

        <div className="mt-4 card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted">Пуш-уведомления</div>
              <div className="mt-0.5 text-[14px] font-medium">
                {subs > 0 ? "Включены на этом устройстве" : "Выключены"}
              </div>
            </div>
            <Pill variant={subs > 0 ? "success" : "muted"} size="sm">
              {subs > 0 ? "Активно" : "Off"}
            </Pill>
          </div>
          <div className="mt-3">
            <PushToggle hasSubscription={subs > 0} />
          </div>
        </div>

        <div className="mt-4 card p-5">
          <div className="text-[11px] uppercase tracking-wide text-muted">Приложение</div>
          <div className="mt-0.5 text-[14px] font-medium">Установить как PWA</div>
          <p className="mt-1 text-[12px] text-muted">Откроется как приложение, без вкладок браузера.</p>
          <div className="mt-3">
            <PwaInstaller />
          </div>
        </div>

        <div className="mt-6">
          <SignOutButton />
        </div>

        <div className="mt-3 text-center text-[11px] text-muted2">
          BondGame MVP · Сделано с ♥ для пар
        </div>
        <div className="h-4" />
      </MobileScroll>
    </>
  );
}

function Row({ title, sub, href }: { title: string; sub?: string; href?: string }) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium">{title}</div>
        {sub ? <div className="mt-0.5 text-[12px] text-muted">{sub}</div> : null}
      </div>
      {href ? <ChevronRight size={18} className="text-muted2" /> : null}
    </>
  );
  if (!href) {
    return <div className="flex items-center gap-3 px-5 py-3.5">{inner}</div>;
  }
  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-alt">
      {inner}
    </Link>
  );
}
