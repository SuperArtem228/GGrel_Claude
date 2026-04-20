import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { BondFace } from "@/components/bond-mark";
import { Coin } from "@/components/bond-mark";
import { Pill } from "@/components/ui/pill";
import { formatLC } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
  const { pair, partner } = await requirePair();
  if (!partner) {
    return (
      <>
        <TopHeader title="Партнёр" backHref="/profile" />
        <MobileScroll>
          <EmptyState title="Партнёр ещё не подключён" body="Пригласите второго участника на экране создания пары" />
        </MobileScroll>
      </>
    );
  }

  const [giftsSent, giftsReceived] = await Promise.all([
    prisma.ownedReward.count({
      where: { pairId: pair.id, ownerUserId: partner.user.id, purchasedByUserId: { not: partner.user.id } },
    }),
    prisma.ownedReward.count({
      where: { pairId: pair.id, purchasedByUserId: partner.user.id, ownerUserId: { not: partner.user.id } },
    }),
  ]);

  return (
    <>
      <TopHeader title="Партнёр" backHref="/profile" />
      <MobileScroll>
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <BondFace size={56} />
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted">Партнёр</div>
              <div className="mt-0.5 h-display text-[22px]">{partner.user.displayName}</div>
              <div className="mt-1 flex gap-1.5">
                <Pill variant="muted" size="sm">
                  Роль {partner.role}
                </Pill>
                <Pill variant="accent-soft" size="sm">
                  🔥 {partner.personalStreak}
                </Pill>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-surface-alt p-3">
              <Coin size={12} />
              <div className="mt-1 text-[15px] font-bold">{formatLC(partner.personalWalletBalance)}</div>
              <div className="text-[11px] text-muted">LC у партнёра</div>
            </div>
            <div className="rounded-md bg-surface-alt p-3">
              <div className="text-[22px]">🎁</div>
              <div className="mt-0.5 text-[15px] font-bold">{giftsSent}</div>
              <div className="text-[11px] text-muted">Подарено вам</div>
            </div>
            <div className="rounded-md bg-surface-alt p-3">
              <div className="text-[22px]">💌</div>
              <div className="mt-0.5 text-[15px] font-bold">{giftsReceived}</div>
              <div className="text-[11px] text-muted">Вы подарили</div>
            </div>
          </div>
        </div>

        <div className="mt-4 card-soft p-4 text-[13px] text-muted">
          Совет: дарите действия, а не только вещи. Запишите общий вечер без телефонов —
          это тоже награда.
        </div>
        <div className="h-4" />
      </MobileScroll>
    </>
  );
}
