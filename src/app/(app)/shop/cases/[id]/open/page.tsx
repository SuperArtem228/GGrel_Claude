import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { CaseOpener } from "./opener";

export const dynamic = "force-dynamic";

export default async function OpenCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pair } = await requirePair();
  const c = await prisma.caseTemplate.findUnique({
    where: { id },
    include: {
      items: { include: { rewardTemplate: true }, orderBy: { probabilityPercent: "desc" } },
    },
  });
  if (!c || !c.active) notFound();
  if (c.isSpicy && !pair.spicyEnabled) notFound();

  return (
    <>
      <TopHeader title="Открытие кейса" backHref={c.isSpicy ? `/spicy/cases/${c.id}` : `/shop/cases/${c.id}`} />
      <MobileScroll>
        <CaseOpener
          id={c.id}
          title={c.title}
          emoji={c.emoji}
          isSpicy={c.isSpicy}
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
    </>
  );
}
