import Link from "next/link";
import { requirePair } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { WalletCard } from "@/components/wallet-card";
import { TopHeader } from "@/components/top-header";
import { BondMark } from "@/components/bond-mark";
import { MobileScroll } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { TaskCard } from "@/components/task-card";
import { ChallengeCard } from "@/components/challenge-card";
import { EmptyState } from "@/components/empty-state";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { sweepExpired } from "@/actions/tasks";
import { dailyPeriodKey, weeklyPeriodKey } from "@/lib/utils";
import { PushBanner } from "@/components/push-banner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { user, pair, me, partner } = await requirePair();
  await sweepExpired(pair.id);

  const [incoming, outgoing, dailyToday, weekly] = await Promise.all([
    prisma.task.findMany({
      where: { pairId: pair.id, assignedToUserId: user.id, status: { in: ["PROPOSED", "BARGAINING", "ACCEPTED", "IN_PROGRESS"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { createdBy: true },
    }),
    prisma.task.findMany({
      where: { pairId: pair.id, createdByUserId: user.id, status: "PENDING_CONFIRM" },
      orderBy: { completedAt: "desc" },
      take: 2,
      include: { assignedTo: true },
    }),
    prisma.pairChallenge.findMany({
      where: {
        pairId: pair.id,
        periodKey: dailyPeriodKey(new Date(), pair.timezone),
        template: { period: "DAILY" },
      },
      include: { template: true },
      take: 2,
    }),
    prisma.pairChallenge.findFirst({
      where: {
        pairId: pair.id,
        periodKey: weeklyPeriodKey(new Date(), pair.timezone),
        template: { period: "WEEKLY" },
      },
      include: { template: true },
    }),
  ]);

  return (
    <>
      <TopHeader
        left={<BondMark size={24} color="var(--ink)" accent="var(--accent)" />}
        title={pair.name}
        sub={`Привет, ${user.displayName}`}
        right={
          <Link
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt"
          >
            <Bell size={18} />
          </Link>
        }
      />
      <MobileScroll>
        <PushBanner />
        <WalletCard
          personalLc={me.personalWalletBalance}
          commonLc={pair.commonWalletBalance}
          partnerName={partner?.user.displayName}
          streak={pair.coupleStreak}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href="/tasks/new" className="card p-4 transition hover:shadow-lift">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent-ink">
                ＋
              </div>
              <div>
                <div className="text-[13px] font-semibold">Новая задача</div>
                <div className="text-[11px] text-muted">Для партнёра</div>
              </div>
            </div>
          </Link>
          <Link href="/shop" className="card p-4 transition hover:shadow-lift">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-alt">🎁</div>
              <div>
                <div className="text-[13px] font-semibold">Магазин</div>
                <div className="text-[11px] text-muted">Награды и кейсы</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-6">
          <SectionHeader title="На сегодня" sub={`${dailyToday.length} челленджа`} action="Все" href="/challenges" />
          <div className="mt-3 space-y-3">
            {dailyToday.length === 0 ? (
              <EmptyState title="Нет челленджей" body="Зайди в раздел Челленджи и выбери на сегодня." />
            ) : (
              dailyToday.map((pc) => (
                <ChallengeCard
                  key={pc.id}
                  title={pc.template.title}
                  description={pc.template.description}
                  rewardLc={pc.template.rewardLc}
                  period="DAILY"
                  status={pc.status}
                  progress={{ a: pc.progressUserA, b: pc.progressUserB }}
                  totalSteps={pc.template.totalSteps}
                  requiresBoth={pc.template.requiresBoth}
                  isSpicy={pc.template.isSpicy}
                />
              ))
            )}
          </div>
        </div>

        {weekly && (
          <div className="mt-6">
            <SectionHeader title="На неделе" />
            <div className="mt-3">
              <ChallengeCard
                title={weekly.template.title}
                description={weekly.template.description}
                rewardLc={weekly.template.rewardLc}
                period="WEEKLY"
                status={weekly.status}
                progress={{ a: weekly.progressUserA, b: weekly.progressUserB }}
                totalSteps={weekly.template.totalSteps}
                requiresBoth={weekly.template.requiresBoth}
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <SectionHeader title="Входящие задачи" action="Все" href="/tasks" />
          <div className="mt-3 space-y-3">
            {incoming.length === 0 ? (
              <EmptyState title="Пока пусто" body="Когда партнёр пришлёт задачу — она появится здесь." />
            ) : (
              incoming.map((t) => (
                <TaskCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  description={t.description}
                  priceLc={t.priceLc}
                  status={t.status}
                  deadlineAt={t.deadlineAt}
                  fromName={t.createdBy.displayName}
                  isSpicy={t.isSpicy}
                  urgent={t.urgent}
                />
              ))
            )}
          </div>
        </div>

        {outgoing.length > 0 && (
          <div className="mt-6">
            <SectionHeader title="Ждут подтверждения" sub="Ты проверяешь" />
            <div className="mt-3 space-y-3">
              {outgoing.map((t) => (
                <TaskCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  description={t.description}
                  priceLc={t.priceLc}
                  status={t.status}
                  deadlineAt={t.deadlineAt}
                  fromName={t.assignedTo.displayName}
                  directionLabel="Для"
                  isSpicy={t.isSpicy}
                />
              ))}
            </div>
          </div>
        )}

        {pair.spicyEnabled ? (
          <Link
            href="/spicy"
            className="mt-6 block rounded-xl border border-[color:var(--hairline)] bg-plum-wash p-5 text-plum-ink shadow-hair"
          >
            <div className="flex items-center justify-between">
              <div>
                <Pill variant="magenta" size="sm">
                  Приватное
                </Pill>
                <h3 className="mt-2 h-display text-[20px]">Приватная комната</h3>
                <p className="mt-0.5 text-[12px] opacity-70">Только для вас двоих</p>
              </div>
              <div className="text-3xl">🌙</div>
            </div>
          </Link>
        ) : (
          <Link
            href="/spicy"
            className="mt-6 block rounded-xl border border-dashed border-[color:var(--hairline-strong)] bg-surface-alt p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <Pill variant="muted" size="sm">
                  Приватный режим
                </Pill>
                <h3 className="mt-2 h-display text-[18px]">Включается только вместе</h3>
                <p className="mt-0.5 text-[12px] text-muted">
                  Узнать, как появляется приватный слой.
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Открыть
              </Button>
            </div>
          </Link>
        )}

        <div className="h-4" />
      </MobileScroll>
    </>
  );
}
