import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { CaseCard } from "@/components/case-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function SpicyCasesPage() {
  const { pair } = await requirePair();
  if (!pair.spicyEnabled) redirect("/spicy");
  const cases = await prisma.caseTemplate.findMany({
    where: {
      isSpicy: true,
      active: true,
      OR: [{ isSystem: true }, { pairId: pair.id }],
    },
    include: { _count: { select: { items: true } } },
    orderBy: { openPriceLc: "asc" },
  });
  return (
    <div data-mode="spicy">
      <TopHeader title="Приватные кейсы" backHref="/spicy" />
      <MobileScroll>
        <SectionHeader title="Сюрпризы только для двоих" action="Собрать" href="/spicy/cases/new" />
        <div className="mt-3 space-y-3">
          {cases.length === 0 ? (
            <EmptyState title="Пока пусто" body="Соберите кейс из приватных наград" />
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
                isSpicy
              />
            ))
          )}
        </div>
        <div className="h-4" />
      </MobileScroll>
    </div>
  );
}
