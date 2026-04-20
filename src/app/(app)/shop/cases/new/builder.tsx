"use client";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Coin } from "@/components/bond-mark";
import { formatLC, cn } from "@/lib/utils";
import { createCaseAction } from "@/actions/cases";
import { useRouter } from "next/navigation";

type RewardOpt = {
  id: string;
  title: string;
  emoji?: string | null;
  priceLc: number;
  category: string;
};

type Slot = { rewardTemplateId: string; probabilityPercent: number };

export function CaseBuilder({ rewards, spicyEnabled }: { rewards: RewardOpt[]; spicyEnabled: boolean }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openPriceLc, setOpenPriceLc] = useState(120);
  const [emoji, setEmoji] = useState("🎁");
  const [isSpicy, setIsSpicy] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const total = useMemo(() => slots.reduce((s, i) => s + i.probabilityPercent, 0), [slots]);
  const byId = useMemo(() => Object.fromEntries(rewards.map((r) => [r.id, r])), [rewards]);

  function addReward(id: string) {
    if (slots.some((s) => s.rewardTemplateId === id)) return;
    if (slots.length >= 8) return;
    const remaining = Math.max(1, 100 - total);
    const init = slots.length === 0 ? Math.min(100, remaining) : Math.min(20, remaining);
    setSlots((s) => [...s, { rewardTemplateId: id, probabilityPercent: init }]);
  }

  function removeSlot(id: string) {
    setSlots((s) => s.filter((x) => x.rewardTemplateId !== id));
  }

  function setProb(id: string, v: number) {
    const clamped = Math.max(1, Math.min(95, v | 0));
    setSlots((s) => s.map((x) => (x.rewardTemplateId === id ? { ...x, probabilityPercent: clamped } : x)));
  }

  function autoBalance() {
    if (slots.length === 0) return;
    const even = Math.floor(100 / slots.length);
    let rest = 100 - even * slots.length;
    setSlots((s) =>
      s.map((x, i) => ({
        ...x,
        probabilityPercent: even + (i === 0 ? rest : 0),
      })),
    );
  }

  const submit = () => {
    setErr(null);
    if (!title.trim()) {
      setErr("Укажите название");
      return;
    }
    if (slots.length < 3) {
      setErr("Добавьте минимум 3 награды");
      return;
    }
    if (total !== 100) {
      setErr("Сумма вероятностей должна быть 100%");
      return;
    }
    const fd = new FormData();
    fd.set(
      "payload",
      JSON.stringify({
        title,
        description: description || null,
        openPriceLc: Number(openPriceLc),
        isSpicy,
        emoji,
        items: slots,
      }),
    );
    start(async () => {
      const res = await createCaseAction(null, fd);
      if (res?.error) {
        setErr(res.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <h2 className="h-display text-[16px]">О кейсе</h2>
        <div className="mt-3 flex flex-col gap-3">
          <Input label="Название" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Вечер сюрприз" />
          <Textarea label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Цена открытия (LC)"
              type="number"
              min={40}
              max={600}
              value={openPriceLc}
              onChange={(e) => setOpenPriceLc(Number(e.target.value) || 0)}
            />
            <Input label="Эмодзи" value={emoji} onChange={(e) => setEmoji(e.target.value.slice(0, 4))} />
          </div>
          {spicyEnabled ? (
            <label className="flex items-center gap-2 rounded-md bg-surface-alt px-3 py-2.5 text-[13px]">
              <input type="checkbox" checked={isSpicy} onChange={(e) => setIsSpicy(e.target.checked)} className="h-4 w-4" />
              <span>Приватный (spicy) кейс</span>
            </label>
          ) : null}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="h-display text-[16px]">Состав ({slots.length}/8)</h2>
          <div className="flex items-center gap-2 text-[12px]">
            <Pill variant={total === 100 ? "success" : total > 100 ? "danger" : "warning"} size="sm">
              {total}% / 100%
            </Pill>
            <button
              type="button"
              onClick={autoBalance}
              className="rounded-pill bg-surface-alt px-3 py-1 text-[12px] text-ink hover:bg-bg-deep"
            >
              Авто
            </button>
          </div>
        </div>

        {slots.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-[color:var(--hairline-strong)] bg-surface-alt p-4 text-center text-[13px] text-muted">
            Добавьте минимум 3 награды из списка ниже
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {slots.map((s) => {
              const r = byId[s.rewardTemplateId];
              if (!r) return null;
              return (
                <div key={s.rewardTemplateId} className="flex items-center gap-3 rounded-lg bg-surface-alt p-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-[20px]">
                    {r.emoji || "🎁"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{r.title}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                      <Coin size={10} /> {formatLC(r.priceLc)}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={95}
                    value={s.probabilityPercent}
                    onChange={(e) => setProb(s.rewardTemplateId, Number(e.target.value) || 0)}
                    className="h-9 w-14 rounded-md border border-[color:var(--hairline-strong)] bg-surface px-2 text-center text-[13px]"
                  />
                  <span className="text-[11px] text-muted">%</span>
                  <button
                    type="button"
                    onClick={() => removeSlot(s.rewardTemplateId)}
                    className="ml-1 rounded-full p-1 text-muted hover:bg-bg-deep hover:text-ink"
                    aria-label="Убрать"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-4">
        <h2 className="h-display text-[16px]">Доступные награды</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {rewards.map((r) => {
            const added = slots.some((x) => x.rewardTemplateId === r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => addReward(r.id)}
                disabled={added || slots.length >= 8}
                className={cn(
                  "flex items-start gap-2 rounded-lg border p-2.5 text-left transition",
                  added
                    ? "cursor-default border-[color:var(--hairline)] bg-surface-alt opacity-60"
                    : "border-[color:var(--hairline)] bg-surface hover:shadow-hair",
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-[18px]">
                  {r.emoji || "🎁"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-[12px] font-medium">{r.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                    <Coin size={9} /> {formatLC(r.priceLc)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {err ? <p className="text-[12px] text-danger">{err}</p> : null}
      <Button variant="accent" size="lg" onClick={submit} loading={pending}>
        Создать кейс
      </Button>
    </div>
  );
}
