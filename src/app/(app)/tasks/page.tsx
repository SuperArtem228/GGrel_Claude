import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { sweepExpired } from "@/actions/tasks";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { TaskCard } from "@/components/task-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { TasksTabs } from "./tabs";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { user, pair } = await requirePair();
  await sweepExpired(pair.id);
  const params = await searchParams;
  const tab = params.tab || "incoming";

  const [incoming, outgoing, archive] = await Promise.all([
    prisma.task.findMany({
      where: { pairId: pair.id, assignedToUserId: user.id, status: { in: ["PROPOSED", "BARGAINING", "ACCEPTED", "IN_PROGRESS", "PENDING_CONFIRM"] } },
      include: { createdBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { pairId: pair.id, createdByUserId: user.id, status: { in: ["PROPOSED", "BARGAINING", "ACCEPTED", "IN_PROGRESS", "PENDING_CONFIRM", "DISPUTED"] } },
      include: { assignedTo: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { pairId: pair.id, status: { in: ["CONFIRMED", "CANCELLED", "EXPIRED"] } },
      include: { createdBy: true, assignedTo: true },
      orderBy: { updatedAt: "desc" },
      take: 40,
    }),
  ]);

  const list = tab === "outgoing" ? outgoing : tab === "archive" ? archive : incoming;

  return (
    <>
      <TopHeader
        title="Задачи"
        sub={`${incoming.length} входящих · ${outgoing.length} исходящих`}
        right={
          <Link href="/tasks/new">
            <Button variant="accent" size="sm">
              + Новая
            </Button>
          </Link>
        }
      />
      <TasksTabs current={tab} />
      <MobileScroll>
        {list.length === 0 ? (
          <EmptyState
            title={tab === "archive" ? "Архив пуст" : "Пусто"}
            body="Создайте новую задачу или подождите, пока партнёр что-то пришлёт."
            action={
              tab !== "archive" ? (
                <Link href="/tasks/new">
                  <Button variant="accent" size="sm">
                    Создать задачу
                  </Button>
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((t) => {
              const fromUser = tab === "outgoing" ? (t as any).assignedTo : (t as any).createdBy;
              return (
                <TaskCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  description={t.description}
                  priceLc={t.priceLc}
                  status={t.status}
                  deadlineAt={t.deadlineAt}
                  fromName={fromUser?.displayName}
                  directionLabel={tab === "outgoing" ? "Для" : "От"}
                  urgent={t.urgent}
                  isSpicy={t.isSpicy}
                />
              );
            })}
          </div>
        )}
        <div className="mt-8">
          <Link href="/tasks/exchange" className="block text-center text-[13px] font-medium text-muted underline-offset-4 hover:underline">
            Биржа задач →
          </Link>
        </div>
      </MobileScroll>
    </>
  );
}
