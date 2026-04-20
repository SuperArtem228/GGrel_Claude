import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { WalletCard } from "@/components/wallet-card";
import { Pill } from "@/components/ui/pill";
import { BondFace } from "@/components/bond-mark";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, pair, me, partner } = await requirePair();

  const [tasksCompleted, challengesClaimed, casesOpened, rewardsOwned] = await Promise.all([
    prisma.task.count({ where: { pairId: pair.id, status: "CONFIRMED" } }),
    prisma.pairChallenge.count({ where: { pairId: pair.id, status: "CLAIMED" } }),
    prisma.caseOpen.count({ where: { pairId: pair.id } }),
    prisma.ownedReward.count({ where: { pairId: pair.id } }),
  ]);

  return (
    <>
      <TopHeader title="Профиль" />
      <MobileScroll>
        <WalletCard
          personalLc={me.personalWalletBalance}
          commonLc={pair.commonWalletBalance}
          partnerName={partner?.user.displayName}
          streak={pair.coupleStreak}
        />

        <div className="mt-4 card p-5">
          <div className="flex items-center gap-3">
            <BondFace size={48} />
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wide text-muted">Ваша пара</div>
              <div className="mt-0.5 h-display text-[18px]">{pair.name ?? "Без названия"}</div>
              <div className="mt-0.5 text-[12px] text-muted">
                С {user.displayName} · {partner ? partner.user.displayName : "ждём партнёра"}
              </div>
            </div>
            <Pill variant="accent-soft" size="sm">
              🔥 {pair.coupleStreak}
            </Pill>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
            <StatCell label="Задач закрыто" value={tasksCompleted} />
            <StatCell label="Челленджей" value={challengesClaimed} />
            <StatCell label="Кейсов открыто" value={casesOpened} />
            <StatCell label="Наград в обороте" value={rewardsOwned} />
          </div>
        </div>

        <div className="mt-6">
          <SectionHeader title="Меню" />
          <div className="mt-3 card divide-y divide-[color:var(--hairline)]">
            <RowLink href="/profile/partner" title="Партнёр" sub={partner ? partner.user.displayName : "Не подключён"} />
            <RowLink href="/profile/settings" title="Настройки" sub="Профиль, уведомления, приватность" />
            <RowLink href="/tasks/exchange" title="Биржа задач" sub="Публичные задачи пары" />
            <RowLink href="/shop/my" title="Мои награды" />
            <RowLink href="/spicy" title="Приватный режим" sub={pair.spicyEnabled ? "Включён" : "Выключен"} />
          </div>
        </div>

        <div className="h-4" />
      </MobileScroll>
    </>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-surface-alt px-3 py-2.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-0.5 text-[18px] font-bold tracking-tight">{value}</div>
    </div>
  );
}

function RowLink({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-alt">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium">{title}</div>
        {sub ? <div className="mt-0.5 text-[12px] text-muted">{sub}</div> : null}
      </div>
      <ChevronRight size={18} className="text-muted2" />
    </Link>
  );
}
