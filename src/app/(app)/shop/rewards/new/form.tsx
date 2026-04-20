"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { createCustomRewardAction, type RewardState } from "@/actions/rewards";

export function NewRewardForm({ spicyEnabled }: { spicyEnabled: boolean }) {
  const [state, formAction, pending] = useActionState<RewardState, FormData>(
    createCustomRewardAction,
    null,
  );
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input label="Название" name="title" placeholder="Ужин в любимом месте" required minLength={2} maxLength={80} />
      <Textarea label="Описание" name="description" placeholder="Что это значит на практике" maxLength={300} />

      <div>
        <div className="mb-1 text-[12px] font-medium text-muted">Тип</div>
        <div className="grid grid-cols-3 gap-2 text-[13px]">
          {[
            { v: "ACTION", l: "Действие" },
            { v: "INSTANT", l: "Мгновенно" },
            { v: "PRIVATE", l: "Приватно" },
          ].map((opt) => (
            <label
              key={opt.v}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-[color:var(--hairline-strong)] bg-surface py-2.5 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input type="radio" name="category" value={opt.v} defaultChecked={opt.v === "ACTION"} className="sr-only" />
              {opt.l}
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Стоимость, LC"
        name="priceLc"
        type="number"
        min={40}
        max={600}
        defaultValue={120}
        required
      />
      <Input label="Эмодзи (опционально)" name="emoji" maxLength={4} placeholder="🎁" />

      {spicyEnabled ? (
        <label className="flex items-center gap-2 rounded-md border border-[color:var(--hairline)] bg-surface-alt px-3 py-2.5 text-[13px]">
          <input type="checkbox" name="isSpicy" className="h-4 w-4" />
          <span>Это приватная (spicy) награда</span>
        </label>
      ) : null}

      {state?.error ? <p className="text-[12px] text-danger">{state.error}</p> : null}

      <Button variant="accent" size="lg" type="submit" loading={pending}>
        Создать награду
      </Button>
    </form>
  );
}
