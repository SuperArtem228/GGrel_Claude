import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Pill } from "@/components/ui/pill";
import { Progress } from "@/components/ui/progress";
import { Coin } from "@/components/bond-mark";
import { formatLC } from "@/lib/utils";
import { ChallengeActions } from "../actions";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pair, me, partner } = await requirePair();
  const pc = await prisma.pairChallenge.findFirst({
    where: { id, pairId: pair.id },
    include: { template: true },
  });
  if (!pc) notFound();

  const tpl = pc.template;
  const pctA = Math.min(100, (pc.progressUserA / tpl.totalSteps) * 100);
  const pctB = Math.min(100, (pc.progressUserB / tpl.totalSteps) * 100);

  return (
    <>
      <TopHeader title="Челлендж" backHref="/challenges" />
      <MobileScroll>
        <div className="card p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill variant={tpl.period === "DAILY" ? "accent-soft" : "plum-soft"} size="sm">
              {tpl.period === "DAILY" ? "Ежедневно" : "Еженедельно"}
            </Pill>
            {tpl.requiresBoth ? (
              <Pill variant="muted" size="sm">
                Вдвоём
              </Pill>
            ) : null}
            {tpl.isSpicy ? (
              <Pill variant="magenta-soft" size="sm">
                🌙 Spicy
              </Pill>
            ) : null}
            {pc.status === "DONE" && (
              <Pill variant="success" size="sm">
                Готово
              </Pill>
            )}
            {pc.status === "CLAIMED" && (
              <Pill variant="muted" size="sm">
                Награда получена
              </Pill>
            )}
          </div>
          <h1 className="mt-3 h-display text-[22px] leading-tight">{tpl.title}</h1>
          {tpl.description ? (
            <p className="mt-2 text-[14px] text-muted">{tpl.description}</p>
          ) : null}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2">
            <Coin size={16} />
            <div className="flex-1">
              <div className="text-[12px] text-muted">Награда</div>
              <div className="text-[16px] font-semibold">{formatLC(tpl.rewardLc)} LC</div>
            </div>
          </div>
        </div>

        <div className="mt-4 card p-5">
          <h2 className="h-display text-[16px]">Прогресс</h2>
          <div className="mt-3 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-[12px] text-muted">
                <span>{me.role === "A" ? "Вы" : partner?.user.displayName ?? "Партнёр A"}</span>
                <span>
                  {pc.progressUserA}/{tpl.totalSteps}
                </span>
              </div>
              <Progress value={pctA} tone="accent" height={8} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[12px] text-muted">
                <span>{me.role === "B" ? "Вы" : partner?.user.displayName ?? "Партнёр B"}</span>
                <span>
                  {pc.progressUserB}/{tpl.totalSteps}
                </span>
              </div>
              <Progress value={pctB} tone="ink" height={8} />
            </div>
          </div>
          <div className="mt-5">
            <ChallengeActions pc={{ id: pc.id, status: pc.status, rewardClaimed: pc.rewardClaimed }} />
          </div>
        </div>

        {tpl.requiresBoth ? (
          <div className="mt-4 card-soft p-4">
            <div className="text-[12px] uppercase tracking-wide text-muted">Подсказка</div>
            <p className="mt-1 text-[14px]">
              Этот челлендж засчитается только когда оба партнёра пройдут все шаги.
            </p>
          </div>
        ) : null}

        <div className="h-4" />
      </MobileScroll>
    </>
  );
}
