import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Pill } from "@/components/ui/pill";
import { Coin } from "@/components/bond-mark";
import { formatLC, timeAgoRu, timeLeftRu } from "@/lib/utils";
import { TaskActions } from "./actions";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, pair } = await requirePair();
  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, pairId: pair.id },
    include: {
      createdBy: true,
      assignedTo: true,
      bargainRounds: { orderBy: { createdAt: "asc" }, include: { actor: true } },
    },
  });
  if (!task) notFound();

  const iAmAssignee = task.assignedToUserId === user.id;
  const iAmCreator = task.createdByUserId === user.id;

  return (
    <>
      <TopHeader title="Задача" backHref="/tasks" />
      <MobileScroll>
        <div className="card p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill variant="accent-soft" size="sm">
              {task.status === "PROPOSED" ? "Предложена" : task.status}
            </Pill>
            {task.urgent && <Pill variant="danger" size="sm">Срочно</Pill>}
            {task.isSpicy && <Pill variant="magenta-soft" size="sm">🌙 Приватно</Pill>}
          </div>
          <h1 className="mt-2 h-display text-[24px]">{task.title}</h1>
          {task.description ? (
            <p className="mt-2 text-[14px] text-muted">{task.description}</p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-md bg-surface-alt p-3">
              <div className="text-muted">Цена</div>
              <div className="mt-0.5 flex items-center gap-1 text-[16px] font-semibold text-ink">
                <Coin size={12} /> {formatLC(task.priceLc)} LC
              </div>
            </div>
            <div className="rounded-md bg-surface-alt p-3">
              <div className="text-muted">Срок</div>
              <div className="mt-0.5 text-[14px] font-semibold text-ink">
                {timeLeftRu(task.deadlineAt) ?? "без срока"}
              </div>
            </div>
            {task.bonusSpeedLc > 0 && (
              <div className="rounded-md bg-surface-alt p-3">
                <div className="text-muted">Бонус за скорость</div>
                <div className="mt-0.5 font-semibold text-ink">+{task.bonusSpeedLc}</div>
              </div>
            )}
            {task.bonusQualityLc > 0 && (
              <div className="rounded-md bg-surface-alt p-3">
                <div className="text-muted">Бонус за качество</div>
                <div className="mt-0.5 font-semibold text-ink">+{task.bonusQualityLc}</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-md bg-surface-alt p-3 text-[12px]">
            <div>
              <div className="text-muted">От</div>
              <div className="font-semibold text-ink">{task.createdBy.displayName}</div>
            </div>
            <div className="text-right">
              <div className="text-muted">Для</div>
              <div className="font-semibold text-ink">{task.assignedTo.displayName}</div>
            </div>
          </div>
        </div>

        {task.bargainRounds.length > 0 && (
          <div className="mt-4 card p-4">
            <div className="text-[13px] font-semibold">Торг</div>
            <div className="mt-2 space-y-2">
              {task.bargainRounds.map((r) => (
                <div key={r.id} className="rounded-md bg-surface-alt p-3 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.actor.displayName}</span>
                    <span className="text-muted">{timeAgoRu(r.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Coin size={12} /> <span className="font-semibold">{formatLC(r.offeredPriceLc)} LC</span>
                  </div>
                  {r.message && <p className="mt-1 text-muted">{r.message}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <TaskActions
          taskId={task.id}
          status={task.status}
          iAmAssignee={iAmAssignee}
          iAmCreator={iAmCreator}
          bargainAllowed={task.bargainAllowed}
          basePrice={task.priceLc}
          bonusSpeedLc={task.bonusSpeedLc}
          bonusQualityLc={task.bonusQualityLc}
          bargainRoundsUsed={task.bargainRounds.length}
        />
      </MobileScroll>
    </>
  );
}
