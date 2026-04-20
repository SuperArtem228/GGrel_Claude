import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { RewardCard } from "@/components/reward-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function SpicyRewardsPage() {
  const { pair } = await requirePair();
  if (!pair.spicyEnabled) redirect("/spicy");
  const rewards = await prisma.rewardTemplate.findMany({
    where: {
      isSpicy: true,
      active: true,
      OR: [{ isSystem: true }, { pairId: pair.id }],
    },
    orderBy: { priceLc: "asc" },
  });
  return (
    <div data-mode="spicy">
      <TopHeader title="Приватные награды" backHref="/spicy" />
      <MobileScroll>
        <SectionHeader
          title="Идеи для двоих"
          sub="Только для вас двоих — нигде больше не светится"
          action="Свой +"
          href="/spicy/rewards/new"
        />
        <div className="mt-3 space-y-2.5">
          {rewards.length === 0 ? (
            <EmptyState
              title="Пока пусто"
              body="Создайте первую приватную награду — в нежном, уважительном тоне"
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
                  isSpicy
                />
              </Link>
            ))
          )}
        </div>
        <div className="h-4" />
      </MobileScroll>
    </div>
  );
}
