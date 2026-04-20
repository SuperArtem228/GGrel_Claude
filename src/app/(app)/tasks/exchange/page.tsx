import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { TaskCard } from "@/components/task-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function ExchangePage() {
  const { pair } = await requirePair();
  const tasks = await prisma.task.findMany({
    where: { pairId: pair.id, onExchange: true, status: "PROPOSED" },
    include: { createdBy: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <TopHeader title="Биржа задач" backHref="/tasks" />
      <MobileScroll>
        {tasks.length === 0 ? (
          <EmptyState title="Биржа пуста" body="Выставите задачу на биржу — партнёр сможет взять её в любое время." />
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                id={t.id}
                title={t.title}
                description={t.description}
                priceLc={t.priceLc}
                status={t.status}
                deadlineAt={t.deadlineAt}
                fromName={t.createdBy.displayName}
              />
            ))}
          </div>
        )}
      </MobileScroll>
    </>
  );
}
