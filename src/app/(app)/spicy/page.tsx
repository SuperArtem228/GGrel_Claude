import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { SpicyConsentToggle } from "./consent";

export const dynamic = "force-dynamic";

export default async function SpicyHubPage() {
  const { user, pair, me, partner } = await requirePair();
  const myConsent = await prisma.spicyConsent.findUnique({
    where: { pairId_userId: { pairId: pair.id, userId: user.id } },
  });
  const partnerConsent = partner
    ? await prisma.spicyConsent.findUnique({
        where: { pairId_userId: { pairId: pair.id, userId: partner.user.id } },
      })
    : null;

  const rewardsCount = pair.spicyEnabled
    ? await prisma.rewardTemplate.count({
        where: {
          isSpicy: true,
          active: true,
          OR: [{ isSystem: true }, { pairId: pair.id }],
        },
      })
    : 0;
  const casesCount = pair.spicyEnabled
    ? await prisma.caseTemplate.count({
        where: {
          isSpicy: true,
          active: true,
          OR: [{ isSystem: true }, { pairId: pair.id }],
        },
      })
    : 0;

  const meEnabled = !!myConsent?.enabled;
  const partnerEnabled = !!partnerConsent?.enabled;
  const roomOpen = pair.spicyEnabled;

  return (
    <div data-mode="spicy">
      <TopHeader title="Приватный режим" />
      <MobileScroll>
        <div className="relative overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-ink p-5 text-white shadow-card">
          <div
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full"
            style={{ background: "var(--magenta)", filter: "blur(52px)", opacity: 0.55 }}
          />
          <div className="relative z-10">
            <div className="text-[11px] uppercase tracking-wide text-white/50">Spicy Mode</div>
            <h1 className="mt-1 h-display text-[24px]">
              {roomOpen ? "Комната открыта" : "Требуется согласие обоих"}
            </h1>
            <p className="mt-1 max-w-[36ch] text-[13px] text-white/60">
              Ничего не появляется в публичных местах. Уведомления приходят нейтральными формулировками.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-md bg-white/6 px-3 py-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                <span className="text-[13px]">Вы</span>
                <Pill variant={meEnabled ? "accent" : "muted"} size="sm">
                  {meEnabled ? "Согласие" : "Нет"}
                </Pill>
              </div>
              <div className="flex items-center justify-between rounded-md bg-white/6 px-3 py-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                <span className="text-[13px]">{partner?.user.displayName ?? "Партнёр"}</span>
                <Pill variant={partnerEnabled ? "accent" : "muted"} size="sm">
                  {partnerEnabled ? "Согласие" : "Ожидается"}
                </Pill>
              </div>
            </div>

            <div className="mt-4">
              <SpicyConsentToggle enabled={meEnabled} />
            </div>
          </div>
        </div>

        {roomOpen ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/spicy/rewards"
              className="rounded-xl border border-[color:var(--hairline)] bg-surface p-4 shadow-hair hover:shadow-card"
            >
              <div className="text-[28px]">🌙</div>
              <div className="mt-2 text-[14px] font-semibold">Приватные награды</div>
              <div className="mt-0.5 text-[11px] text-muted">{rewardsCount} шт.</div>
            </Link>
            <Link
              href="/spicy/cases"
              className="rounded-xl border border-[color:var(--hairline)] bg-surface p-4 shadow-hair hover:shadow-card"
            >
              <div className="text-[28px]">🎁</div>
              <div className="mt-2 text-[14px] font-semibold">Приватные кейсы</div>
              <div className="mt-0.5 text-[11px] text-muted">{casesCount} шт.</div>
            </Link>
          </div>
        ) : (
          <div className="mt-4 card-soft p-5 text-center">
            <div className="text-[40px]">🔒</div>
            <h3 className="mt-2 h-display text-[16px]">
              {meEnabled && !partnerEnabled
                ? "Ждём согласия партнёра"
                : !meEnabled && partnerEnabled
                  ? "Партнёр уже готов"
                  : "Обсудите и согласитесь"}
            </h3>
            <p className="mx-auto mt-1 max-w-[30ch] text-[13px] text-muted">
              Спайси-контент показывается только когда оба явно согласны. Выключить можно в любой момент.
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center">
          <Link href="/spicy/settings">
            <Button variant="ghost" size="md">
              Настройки приватности
            </Button>
          </Link>
        </div>

        <div className="h-4" />
      </MobileScroll>
    </div>
  );
}
