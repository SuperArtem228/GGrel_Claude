import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { CaseOpener } from "@/app/(app)/shop/cases/[id]/open/opener";

export const dynamic = "force-dynamic";

export default async function OpenSpicyCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pair } = await requirePair();
  if (!pair.spicyEnabled) redirect("/spicy");
  const c = await prisma.caseTemplate.findUnique({
    where: { id },
    include: {
      items: { include: { rewardTemplate: true }, orderBy: { probabilityPercent: "desc" } },
    },
  });
  if (!c || !c.active || !c.isSpicy) notFound();
  return (
    <div data-mode="spicy">
      <TopHeader title="Приватный кейс" backHref={`/spicy/cases/${c.id}`} />
      <MobileScroll>
        <CaseOpener
          id={c.id}
          title={c.title}
          emoji={c.emoji}
          isSpicy={true}
          openPriceLc={c.openPriceLc}
          items={c.items.map((it) => ({
            id: it.id,
            title: it.rewardTemplate.title,
            emoji: it.rewardTemplate.emoji,
            isSpicy: it.rewardTemplate.isSpicy,
            priceLc: it.rewardTemplate.priceLc,
            probabilityPercent: it.probabilityPercent,
          }))}
        />
      </MobileScroll>
    </div>
  );
}
