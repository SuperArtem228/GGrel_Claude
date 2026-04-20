import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Coin } from "@/components/bond-mark";
import { Pill } from "@/components/ui/pill";
import { formatLC } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SpicyCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { me, pair } = await requirePair();
  if (!pair.spicyEnabled) redirect("/spicy");
  const c = await prisma.caseTemplate.findUnique({
    where: { id },
    include: {
      items: { include: { rewardTemplate: true }, orderBy: { probabilityPercent: "desc" } },
    },
  });
  if (!c || !c.active || !c.isSpicy) notFound();
  const canAfford = me.personalWalletBalance >= c.openPriceLc;

  return (
    <div data-mode="spicy">
      <TopHeader title="Приватный кейс" backHref="/spicy/cases" />
      <MobileScroll>
        <div className="card overflow-hidden p-0">
          <div className="flex h-44 items-center justify-center bg-magenta-soft text-[72px]">
            {c.emoji || "🌙"}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill variant="magenta-soft" size="sm">
                {c.items.length} наград
              </Pill>
              {c.isSystem ? (
                <Pill variant="muted" size="sm">
                  Системный
                </Pill>
              ) : null}
            </div>
            <h1 className="mt-3 h-display text-[22px] leading-tight">{c.title}</h1>
            {c.description ? <p className="mt-2 text-[14px] text-muted">{c.description}</p> : null}

            <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-alt px-4 py-3">
              <div className="text-[12px] text-muted">Открыть за</div>
              <div className="flex items-center gap-1.5 text-[18px] font-semibold">
                <Coin size={16} />
                {formatLC(c.openPriceLc)} LC
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 card p-5">
          <h2 className="h-display text-[16px]">Шансы</h2>
          <div className="mt-3 space-y-2.5">
            {c.items.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-magenta-soft text-[20px]">
                  {it.rewardTemplate.emoji || "🌙"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[14px] font-medium">{it.rewardTemplate.title}</div>
                    <div className="text-[13px] font-semibold tabular-nums">{it.probabilityPercent}%</div>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-bg-deep">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${it.probabilityPercent}%`, background: "var(--magenta)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Link href={`/spicy/cases/${c.id}/open`} className="block">
            <Button variant="accent" size="lg" className="w-full" disabled={!canAfford}>
              Открыть за {formatLC(c.openPriceLc)} LC
            </Button>
          </Link>
          {!canAfford ? (
            <p className="mt-2 text-center text-[12px] text-warning">
              У вас {formatLC(me.personalWalletBalance)} LC
            </p>
          ) : null}
        </div>

        <div className="h-4" />
      </MobileScroll>
    </div>
  );
}
