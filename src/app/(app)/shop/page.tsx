import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { WalletCard } from "@/components/wallet-card";
import { RewardCard } from "@/components/reward-card";
import { CaseCard } from "@/components/case-card";
import { EmptyState } from "@/components/empty-state";
import { ShopTabs } from "./tabs";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const { pair, me } = await requirePair();
  const tab = params.tab === "cases" ? "cases" : "rewards";

  const [rewards, cases] = await Promise.all([
    prisma.rewardTemplate.findMany({
      where: {
        active: true,
        isSpicy: false,
        OR: [{ isSystem: true }, { pairId: pair.id }],
      },
      orderBy: [{ priceLc: "asc" }, { createdAt: "desc" }],
      take: 40,
    }),
    prisma.caseTemplate.findMany({
      where: {
        active: true,
        isSpicy: false,
        OR: [{ isSystem: true }, { pairId: pair.id }],
      },
      include: { _count: { select: { items: true } } },
      orderBy: [{ openPriceLc: "asc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  return (
    <>
      <TopHeader title="Магазин" />
      <MobileScroll>
        <WalletCard personalLc={me.personalWalletBalance} commonLc={pair.commonWalletBalance} />

        <div className="mt-4">
          <ShopTabs active={tab} />
        </div>

        {tab === "rewards" ? (
          <>
            <div className="mt-6">
              <SectionHeader
                title="Награды"
                sub="Потратьте Love Coins на реальные приятности"
                action="Мои"
                href="/shop/my"
              />
              <div className="mt-3 grid grid-cols-1 gap-2.5">
                {rewards.length === 0 ? (
                  <EmptyState
                    title="Пока нет наград"
                    body="Создайте первую — договоритесь, что ценно для вас"
                    action={
                      <Link
                        href="/shop/rewards/new"
                        className="mt-2 text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
                      >
                        Создать +
                      </Link>
                    }
                  />
                ) : (
                  rewards.map((r) => (
                    <Link key={r.id} href={`/shop/rewards/${r.id}`} className="block">
                      <RewardCard
                        title={r.title}
                        description={r.description}
                        priceLc={r.priceLc}
                        category={r.category}
                        emoji={r.emoji}
                      />
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 card-soft flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="text-[12px] uppercase tracking-wide text-muted">Свой вариант</div>
                <div className="mt-0.5 text-[14px] font-medium">Придумайте свою награду</div>
              </div>
              <Link
                href="/shop/rewards/new"
                className="shrink-0 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white"
              >
                Создать
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6">
              <SectionHeader
                title="Кейсы"
                sub="Сюрприз из ваших же наград — с управляемым шансом"
                action="Собрать свой"
                href="/shop/cases/new"
              />
              <div className="mt-3 grid grid-cols-1 gap-3">
                {cases.length === 0 ? (
                  <EmptyState title="Пока нет кейсов" body="Соберите первый из своих наград" />
                ) : (
                  cases.map((c) => (
                    <CaseCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      description={c.description}
                      openPriceLc={c.openPriceLc}
                      emoji={c.emoji}
                      itemsCount={c._count.items}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <div className="h-4" />
      </MobileScroll>
    </>
  );
}
