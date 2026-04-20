"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buyRewardAction } from "@/actions/rewards";

export function BuyReward({
  rewardId,
  partnerName,
  disabled,
}: {
  rewardId: string;
  partnerName?: string;
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"self" | "partner">("self");
  const router = useRouter();

  const run = () =>
    start(async () => {
      setErr(null);
      try {
        await buyRewardAction(rewardId, mode === "partner");
        router.push("/shop/my");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Не удалось купить");
      }
    });

  return (
    <div className="card p-4">
      <div className="text-[12px] uppercase tracking-wide text-muted">Для кого</div>
      <div className="mt-2 inline-flex w-full rounded-pill border border-[color:var(--hairline)] bg-surface p-1 text-[13px]">
        <button
          type="button"
          onClick={() => setMode("self")}
          className={`flex-1 rounded-pill px-3 py-1.5 text-center ${
            mode === "self" ? "bg-ink text-white" : "text-muted"
          }`}
        >
          Себе
        </button>
        <button
          type="button"
          onClick={() => setMode("partner")}
          className={`flex-1 rounded-pill px-3 py-1.5 text-center ${
            mode === "partner" ? "bg-ink text-white" : "text-muted"
          }`}
          disabled={!partnerName}
        >
          {partnerName ? `В подарок ${partnerName}` : "Партнёру"}
        </button>
      </div>

      {err ? <p className="mt-2 text-[12px] text-danger">{err}</p> : null}

      <Button
        className="mt-3 w-full"
        variant="accent"
        size="lg"
        loading={pending}
        onClick={run}
        disabled={disabled}
      >
        {mode === "partner" ? "Купить в подарок" : "Купить для себя"}
      </Button>
    </div>
  );
}
