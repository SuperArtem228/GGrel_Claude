"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { activateRewardAction, fulfillRewardAction } from "@/actions/rewards";
import type { RewardStatus } from "@prisma/client";

export function OwnedRewardActions({ id, status }: { id: string; status: RewardStatus }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  if (status === "ACTIVATED") {
    return (
      <div className="flex flex-col gap-2">
        {err ? <p className="text-[12px] text-danger">{err}</p> : null}
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12px] text-muted">Ожидает исполнения от партнёра</div>
          <Button
            variant="soft"
            size="sm"
            loading={pending}
            onClick={() =>
              start(async () => {
                try {
                  await fulfillRewardAction(id);
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Не удалось");
                }
              })
            }
          >
            Закрыть
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {err ? <p className="mb-2 text-[12px] text-danger">{err}</p> : null}
      <Button
        variant="accent"
        size="md"
        className="w-full"
        loading={pending}
        onClick={() =>
          start(async () => {
            try {
              await activateRewardAction(id);
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Не удалось активировать");
            }
          })
        }
      >
        Активировать
      </Button>
    </div>
  );
}
