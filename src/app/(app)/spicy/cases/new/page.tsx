import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { CaseBuilder } from "@/app/(app)/shop/cases/new/builder";

export const dynamic = "force-dynamic";

export default async function NewSpicyCasePage() {
  const { pair } = await requirePair();
  if (!pair.spicyEnabled) redirect("/spicy");
  const rewards = await prisma.rewardTemplate.findMany({
    where: {
      active: true,
      isSpicy: true,
      OR: [{ isSystem: true }, { pairId: pair.id }],
    },
    orderBy: { priceLc: "asc" },
  });
  return (
    <div data-mode="spicy">
      <TopHeader title="Собрать приватный кейс" backHref="/spicy/cases" />
      <MobileScroll>
        <CaseBuilder
          rewards={rewards.map((r) => ({
            id: r.id,
            title: r.title,
            emoji: r.emoji,
            priceLc: r.priceLc,
            category: r.category,
          }))}
          spicyEnabled={true}
        />
        <p className="mt-3 rounded-md bg-surface-alt p-3 text-[12px] text-muted">
          Отметьте «Приватный кейс» сверху, чтобы он остался только здесь.
        </p>
      </MobileScroll>
    </div>
  );
}
