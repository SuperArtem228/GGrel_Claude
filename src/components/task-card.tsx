import Link from "next/link";
import { Coin } from "./bond-mark";
import { Pill } from "./ui/pill";
import { formatLC, timeLeftRu } from "@/lib/utils";
import type { TaskStatus } from "@prisma/client";

const statusLabel: Record<TaskStatus, { label: string; variant: React.ComponentProps<typeof Pill>["variant"] }> = {
  DRAFT: { label: "Черновик", variant: "muted" },
  PROPOSED: { label: "Предложена", variant: "accent-soft" },
  BARGAINING: { label: "Торг", variant: "warning" },
  ACCEPTED: { label: "Принята", variant: "success" },
  IN_PROGRESS: { label: "В процессе", variant: "ink" },
  PENDING_CONFIRM: { label: "Ждёт подтверждения", variant: "accent" },
  DISPUTED: { label: "Спор", variant: "danger" },
  CONFIRMED: { label: "Готово", variant: "success" },
  CANCELLED: { label: "Отменена", variant: "muted" },
  EXPIRED: { label: "Истекла", variant: "muted" },
};

export function TaskCard({
  id,
  title,
  description,
  priceLc,
  status,
  deadlineAt,
  fromName,
  directionLabel,
  urgent,
  isSpicy,
}: {
  id: string;
  title: string;
  description?: string | null;
  priceLc: number;
  status: TaskStatus;
  deadlineAt?: Date | string | null;
  fromName?: string;
  directionLabel?: "От" | "Для" | string;
  urgent?: boolean;
  isSpicy?: boolean;
}) {
  const st = statusLabel[status];
  const tl = timeLeftRu(deadlineAt);
  return (
    <Link
      href={`/tasks/${id}`}
      className="group block rounded-xl border border-[color:var(--hairline)] bg-surface p-4 shadow-hair transition-shadow hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill variant={st.variant} size="sm">
              {st.label}
            </Pill>
            {urgent ? (
              <Pill variant="danger" size="sm">
                Срочно
              </Pill>
            ) : null}
            {isSpicy ? (
              <Pill variant="plum-soft" size="sm">
                🌙
              </Pill>
            ) : null}
            {tl ? (
              <span className="text-[11px] text-muted">· {tl}</span>
            ) : null}
          </div>

          <h3 className="mt-1.5 line-clamp-1 text-[15px] font-semibold tracking-tight">{title}</h3>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-[13px] text-muted">{description}</p>
          ) : null}

          {fromName ? (
            <div className="mt-2 text-[11px] text-muted">
              {directionLabel || "От"} <span className="text-ink">{fromName}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1 text-[16px] font-semibold">
            <Coin size={14} />
            {formatLC(priceLc)}
          </div>
          <div className="text-[10px] uppercase text-muted2">LC</div>
        </div>
      </div>
    </Link>
  );
}
