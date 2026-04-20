import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Pill } from "@/components/ui/pill";
import { Coin } from "@/components/bond-mark";
import { formatLC } from "@/lib/utils";
import { BuyReward } from "./buy";

export const dynamic = "force-dynamic";

export default async function RewardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { me, partner, pair } = await requirePair();
  const r = await prisma.rewardTemplate.findUnique({ where: { id } });
  if (!r || !r.active) notFound();
  if (r.isSpicy && !pair.spicyEnabled) notFound();

  const canAfford = me.personalWalletBalance >= r.priceLc;

  return (
    <>
      <TopHeader title="Награда" backHref={r.isSpicy ? "/spicy/rewards" : "/shop"} />
      <MobileScroll>
        <div className="card overflow-hidden p-0">
          <div
            className="flex h-44 items-center justify-center text-[72px]"
            style={{
              background: r.isSpicy ? "var(--magenta-soft)" : "var(--accent-soft)",
            }}
          >
            {r.emoji || (r.isSpicy ? "🌙" : "🎁")}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill variant={r.category === "INSTANT" ? "accent-soft" : r.isSpicy ? "magenta-soft" : "muted"} size="sm">
                {r.category === "ACTION" ? "Действие" : r.category === "INSTANT" ? "Мгновенно" : "Приватно"}
              </Pill>
              {r.isSystem ? (
                <Pill variant="muted" size="sm">
                  Системная
                </Pill>
              ) : null}
            </div>
            <h1 className="mt-3 h-display text-[22px] leading-tight">{r.title}</h1>
            {r.description ? <p className="mt-2 text-[14px] text-muted">{r.description}</p> : null}

            <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-alt px-4 py-3">
              <div className="text-[12px] text-muted">Стоимость</div>
              <div className="flex items-center gap-1.5 text-[18px] font-semibold">
                <Coin size={16} />
                {formatLC(r.priceLc)} LC
              </div>
            </div>

            {!canAfford ? (
              <p className="mt-2 text-[12px] text-warning">
                У вас {formatLC(me.personalWalletBalance)} LC. Нужно ещё {formatLC(r.priceLc - me.personalWalletBalance)}.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <BuyReward rewardId={r.id} partnerName={partner?.user.displayName} disabled={!canAfford} />
        </div>

        <div className="h-4" />
      </MobileScroll>
    </>
  );
}
