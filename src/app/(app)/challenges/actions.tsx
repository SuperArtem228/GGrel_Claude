"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Coin } from "@/components/bond-mark";
import { Pill } from "@/components/ui/pill";
import { formatLC } from "@/lib/utils";
import {
  completeChallengeStepAction,
  claimChallengeRewardAction,
  selectDailyChallengesAction,
} from "@/actions/challenges";
import type { ChallengeStatus } from "@prisma/client";

type ChallengeActionsProps = {
  pc: { id: string; status: ChallengeStatus; rewardClaimed: boolean };
};

function ChallengeActionsRoot({ pc }: ChallengeActionsProps) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  if (pc.status === "CLAIMED" || pc.rewardClaimed) {
    return (
      <div className="flex items-center justify-between">
        <Pill variant="muted" size="sm">
          Награда получена
        </Pill>
        <span className="text-[12px] text-muted">Выполнено</span>
      </div>
    );
  }

  if (pc.status === "DONE") {
    return (
      <div className="flex flex-col gap-2">
        {err ? <p className="text-[12px] text-danger">{err}</p> : null}
        <Button
          variant="accent"
          size="md"
          loading={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              try {
                await claimChallengeRewardAction(pc.id);
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Не удалось получить награду");
              }
            })
          }
        >
          Забрать награду
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {err ? <p className="text-[12px] text-danger">{err}</p> : null}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          loading={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              try {
                await completeChallengeStepAction(pc.id);
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Не удалось отметить шаг");
              }
            })
          }
        >
          +1 шаг
        </Button>
        <span className="text-[12px] text-muted">Засчитать ваш прогресс</span>
      </div>
    </div>
  );
}

function AddChallenge({
  templateId,
  title,
  description,
  rewardLc,
  requiresBoth,
}: {
  templateId: string;
  title: string;
  description?: string | null;
  rewardLc: number;
  requiresBoth?: boolean;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-[color:var(--hairline)] bg-surface-alt p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {requiresBoth ? (
              <Pill variant="muted" size="sm">
                Вдвоём
              </Pill>
            ) : null}
            <Pill variant="accent-soft" size="sm">
              <Coin size={10} /> {formatLC(rewardLc)}
            </Pill>
          </div>
          <div className="mt-1 text-[14px] font-medium tracking-tight">{title}</div>
          {description ? (
            <div className="mt-0.5 line-clamp-2 text-[12px] text-muted">{description}</div>
          ) : null}
        </div>
        <Button
          variant="soft"
          size="sm"
          loading={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              try {
                await selectDailyChallengesAction([templateId]);
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Не удалось добавить");
              }
            })
          }
        >
          Добавить
        </Button>
      </div>
      {err ? <p className="mt-1.5 text-[12px] text-danger">{err}</p> : null}
    </div>
  );
}

export const ChallengeActions = Object.assign(ChallengeActionsRoot, { Add: AddChallenge });
