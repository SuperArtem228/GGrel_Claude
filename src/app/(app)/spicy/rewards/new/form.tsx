"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { createCustomRewardAction, type RewardState } from "@/actions/rewards";

export function NewSpicyRewardForm() {
  const [state, formAction, pending] = useActionState<RewardState, FormData>(
    createCustomRewardAction,
    null,
  );
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="card-soft p-4 text-[12px] text-muted">
        Пишите бережно и с уважением. Эти награды видны только вам двоим.
      </div>

      <Input label="Название" name="title" required minLength={2} maxLength={80} placeholder="Тёплый вечер без гаджетов" />
      <Textarea label="Описание" name="description" maxLength={300} />

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
              <input type="radio" name="category" value={opt.v} defaultChecked={opt.v === "PRIVATE"} className="sr-only" />
              {opt.l}
            </label>
          ))}
        </div>
      </div>

      <Input label="Стоимость, LC" name="priceLc" type="number" min={40} max={600} defaultValue={160} required />
      <Input label="Эмодзи" name="emoji" maxLength={4} defaultValue="🌙" />
      <input type="hidden" name="isSpicy" value="on" />

      {state?.error ? <p className="text-[12px] text-danger">{state.error}</p> : null}

      <Button variant="accent" size="lg" type="submit" loading={pending}>
        Создать
      </Button>
    </form>
  );
}
