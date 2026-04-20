import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { EmptyState } from "@/components/empty-state";
import { Pill } from "@/components/ui/pill";
import { Coin } from "@/components/bond-mark";
import { formatLC } from "@/lib/utils";
import { OwnedRewardActions } from "./actions";

export const dynamic = "force-dynamic";

export default async function MyRewardsPage() {
  const { pair, user } = await requirePair();
  const owned = await prisma.ownedReward.findMany({
    where: { pairId: pair.id, ownerUserId: user.id, status: { in: ["OWNED", "ACTIVATED"] } },
    include: { rewardTemplate: true },
    orderBy: { createdAt: "desc" },
  });

  const fulfilled = await prisma.ownedReward.findMany({
    where: { pairId: pair.id, ownerUserId: user.id, status: "FULFILLED" },
    include: { rewardTemplate: true },
    orderBy: { fulfilledAt: "desc" },
    take: 12,
  });

  return (
    <>
      <TopHeader title="Мои награды" backHref="/shop" />
      <MobileScroll>
        <SectionHeader title="Активные и доступные" sub={`${owned.length} шт.`} />
        <div className="mt-3 space-y-2.5">
          {owned.length === 0 ? (
            <EmptyState title="Пока пусто" body="Купите что-нибудь в магазине — оно появится здесь" />
          ) : (
            owned.map((o) => {
              const t = o.rewardTemplate;
              return (
                <div key={o.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-[24px]"
                      style={{ background: t.isSpicy ? "var(--magenta-soft)" : "var(--accent-soft)" }}
                    >
                      {t.emoji || (t.isSpicy ? "🌙" : "🎁")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Pill
                          variant={o.status === "ACTIVATED" ? "warning" : "accent-soft"}
                          size="sm"
                        >
                          {o.status === "ACTIVATED" ? "Активирована" : "Готова"}
                        </Pill>
                        {t.isSpicy ? (
                          <Pill variant="magenta-soft" size="sm">
                            🌙
                          </Pill>
                        ) : null}
                      </div>
                      <div className="mt-1 text-[14px] font-semibold">{t.title}</div>
                      {t.description ? (
                        <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">{t.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-[13px] font-semibold">
                      <Coin size={12} /> {formatLC(t.priceLc)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <OwnedRewardActions id={o.id} status={o.status} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {fulfilled.length > 0 ? (
          <div className="mt-6">
            <SectionHeader title="История" sub="Выполненные награды" />
            <div className="mt-3 space-y-2">
              {fulfilled.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg bg-surface-alt p-3">
                  <div className="text-[24px]">{o.rewardTemplate.emoji || "✓"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">{o.rewardTemplate.title}</div>
                    <div className="text-[11px] text-muted">
                      {o.fulfilledAt?.toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                  <Pill variant="muted" size="sm">
                    Выполнено
                  </Pill>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="h-4" />
      </MobileScroll>
    </>
  );
}
