import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { ChallengeCard } from "@/components/challenge-card";
import { EmptyState } from "@/components/empty-state";
import { dailyPeriodKey, weeklyPeriodKey } from "@/lib/utils";
import { ChallengeActions } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const { pair } = await requirePair();
  const dayKey = dailyPeriodKey(new Date(), pair.timezone);
  const weekKey = weeklyPeriodKey(new Date(), pair.timezone);

  const [dailySelected, weekly, dailyPool] = await Promise.all([
    prisma.pairChallenge.findMany({
      where: { pairId: pair.id, periodKey: dayKey, template: { period: "DAILY" } },
      include: { template: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pairChallenge.findMany({
      where: { pairId: pair.id, periodKey: weekKey, template: { period: "WEEKLY" } },
      include: { template: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.challengeTemplate.findMany({
      where: { period: "DAILY", active: true, isSpicy: pair.spicyEnabled ? undefined : false },
      take: 12,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const selectedIds = new Set(dailySelected.map((d) => d.templateId));
  const poolFiltered = dailyPool.filter((t) => !selectedIds.has(t.id)).slice(0, 6);

  return (
    <>
      <TopHeader title="Челленджи" />
      <MobileScroll>
        <div className="card relative overflow-hidden p-5">
          <div className="lime-blob absolute -right-10 -top-10 h-40 w-40" />
          <div className="relative z-10">
            <div className="text-[11px] uppercase tracking-wide text-muted">Пара</div>
            <div className="mt-1 h-display text-[24px]">Ваша серия · 🔥 {pair.coupleStreak}</div>
            <p className="mt-1 max-w-[32ch] text-[12px] text-muted">
              Держите серию — даже маленький прогресс сегодня считается.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <SectionHeader title="На сегодня" sub={`${dailySelected.length}/3 выбрано`} />
          <div className="mt-3 space-y-3">
            {dailySelected.length === 0 ? (
              <EmptyState title="Ничего не выбрано" body="Выбери до трёх челленджей на сегодня из списка ниже." />
            ) : (
              dailySelected.map((pc) => (
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
                >
                  <ChallengeActions pc={{ id: pc.id, status: pc.status, rewardClaimed: pc.rewardClaimed }} />
                </ChallengeCard>
              ))
            )}
          </div>
        </div>

        {dailySelected.length < 3 && poolFiltered.length > 0 && (
          <div className="mt-6">
            <SectionHeader title="Добавить на сегодня" sub="Выбери понравившиеся" />
            <div className="mt-3 space-y-2">
              {poolFiltered.map((t) => (
                <ChallengeActions.Add key={t.id} templateId={t.id} title={t.title} rewardLc={t.rewardLc} description={t.description} requiresBoth={t.requiresBoth} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <SectionHeader title="На неделе" />
          <div className="mt-3 space-y-3">
            {weekly.length === 0 ? (
              <EmptyState title="Нет активного недельного челленджа" />
            ) : (
              weekly.map((pc) => (
                <ChallengeCard
                  key={pc.id}
                  title={pc.template.title}
                  description={pc.template.description}
                  rewardLc={pc.template.rewardLc}
                  period="WEEKLY"
                  status={pc.status}
                  progress={{ a: pc.progressUserA, b: pc.progressUserB }}
                  totalSteps={pc.template.totalSteps}
                  requiresBoth={pc.template.requiresBoth}
                >
                  <ChallengeActions pc={{ id: pc.id, status: pc.status, rewardClaimed: pc.rewardClaimed }} />
                </ChallengeCard>
              ))
            )}
          </div>
        </div>

        <div className="h-4" />
      </MobileScroll>
    </>
  );
}
