import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { CaseBuilder } from "./builder";

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  const { pair } = await requirePair();
  const rewards = await prisma.rewardTemplate.findMany({
    where: {
      active: true,
      isSpicy: false,
      OR: [{ isSystem: true }, { pairId: pair.id }],
    },
    orderBy: { priceLc: "asc" },
  });
  return (
    <>
      <TopHeader title="Собрать кейс" backHref="/shop?tab=cases" />
      <MobileScroll>
        <CaseBuilder
          rewards={rewards.map((r) => ({
            id: r.id,
            title: r.title,
            emoji: r.emoji,
            priceLc: r.priceLc,
            category: r.category,
          }))}
          spicyEnabled={pair.spicyEnabled}
        />
      </MobileScroll>
    </>
  );
}
