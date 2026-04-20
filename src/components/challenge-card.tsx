import { Coin } from "./bond-mark";
import { Pill } from "./ui/pill";
import { Progress } from "./ui/progress";
import { formatLC } from "@/lib/utils";
import type { ChallengeStatus, ChallengePeriod } from "@prisma/client";

export function ChallengeCard({
  title,
  description,
  rewardLc,
  period,
  status,
  progress,
  totalSteps,
  requiresBoth,
  isSpicy,
  children,
}: {
  title: string;
  description?: string;
  rewardLc: number;
  period: ChallengePeriod;
  status: ChallengeStatus;
  progress: { a: number; b: number };
  totalSteps: number;
  requiresBoth?: boolean;
  isSpicy?: boolean;
  children?: React.ReactNode;
}) {
  const pctA = Math.min(100, (progress.a / totalSteps) * 100);
  const pctB = Math.min(100, (progress.b / totalSteps) * 100);
  return (
    <div className="rounded-xl border border-[color:var(--hairline)] bg-surface p-4 shadow-hair">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill variant={period === "DAILY" ? "accent-soft" : "plum-soft"} size="sm">
              {period === "DAILY" ? "День" : "Неделя"}
            </Pill>
            {requiresBoth ? (
              <Pill variant="muted" size="sm">
                Вдвоём
              </Pill>
            ) : null}
            {isSpicy ? (
              <Pill variant="magenta-soft" size="sm">
                🌙
              </Pill>
            ) : null}
            {status === "DONE" && (
              <Pill variant="success" size="sm">
                Готово
              </Pill>
            )}
            {status === "CLAIMED" && (
              <Pill variant="muted" size="sm">
                Награда получена
              </Pill>
            )}
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight">{title}</h3>
          {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
        </div>
        <div className="flex items-center gap-1 text-[16px] font-semibold">
          <Coin size={14} /> {formatLC(rewardLc)}
        </div>
      </div>

      {requiresBoth ? (
        <div className="mt-3 space-y-1.5">
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span>Партнёр A</span>
              <span>
                {progress.a}/{totalSteps}
              </span>
            </div>
            <Progress value={pctA} tone="accent" height={6} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span>Партнёр B</span>
              <span>
                {progress.b}/{totalSteps}
              </span>
            </div>
            <Progress value={pctB} tone="ink" height={6} />
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-muted">
            <span>Прогресс</span>
            <span>
              {Math.max(progress.a, progress.b)}/{totalSteps}
            </span>
          </div>
          <Progress value={Math.max(pctA, pctB)} tone="ink" height={6} />
        </div>
      )}

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
