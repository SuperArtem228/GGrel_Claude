"use client";
import { useActionState, useState } from "react";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { createTaskAction } from "@/actions/tasks";
import { Coin } from "@/components/bond-mark";
import { cn } from "@/lib/utils";

const categories = [
  { key: "CARE", label: "💖 Забота" },
  { key: "HOME", label: "🏠 Дом" },
  { key: "FOOD", label: "🍳 Еда" },
  { key: "TIME", label: "⏱️ Время" },
  { key: "SURPRISE", label: "🎁 Сюрприз" },
  { key: "OTHER", label: "✨ Другое" },
];

export default function NewTaskPage() {
  const [state, action, pending] = useActionState(createTaskAction, null);
  const [cat, setCat] = useState("CARE");
  const [price, setPrice] = useState(60);

  return (
    <>
      <TopHeader title="Новая задача" backHref="/tasks" />
      <MobileScroll>
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="category" value={cat} />

          <div>
            <div className="mb-2 text-[12px] font-medium text-muted">Категория</div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCat(c.key)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-[12px] font-medium transition",
                    cat === c.key
                      ? "border-ink bg-ink text-white"
                      : "border-[color:var(--hairline-strong)] bg-surface text-muted hover:text-ink",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <Input name="title" label="Название" placeholder="Прогулка перед ужином" required maxLength={120} />
          <Textarea name="description" label="Описание" placeholder="Расскажи деталями..." maxLength={800} />

          <div>
            <div className="mb-2 flex items-center justify-between text-[12px] font-medium">
              <span className="text-muted">Цена</span>
              <span className="flex items-center gap-1 font-semibold text-ink">
                <Coin size={12} /> {price} LC
              </span>
            </div>
            <input
              type="range"
              name="priceLc"
              min={20}
              max={500}
              step={10}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-black"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>20 LC</span>
              <span>500 LC</span>
            </div>
          </div>

          <Input name="deadlineHours" type="number" label="Срок (часов)" min={1} max={168} defaultValue={6} />

          <Input name="bonusSpeedLc" type="number" label="Бонус за скорость" min={0} max={200} defaultValue={0} />
          <Input name="bonusQualityLc" type="number" label="Бонус за качество" min={0} max={200} defaultValue={0} />

          <label className="flex items-center justify-between rounded-md border border-[color:var(--hairline)] bg-surface p-4">
            <div>
              <div className="text-[14px] font-medium">Срочно</div>
              <div className="text-[12px] text-muted">Показать партнёру как приоритет</div>
            </div>
            <input type="checkbox" name="urgent" className="h-5 w-5 accent-black" />
          </label>

          <label className="flex items-center justify-between rounded-md border border-[color:var(--hairline)] bg-surface p-4">
            <div>
              <div className="text-[14px] font-medium">Разрешить торг</div>
              <div className="text-[12px] text-muted">До 2 раундов, до 150% цены</div>
            </div>
            <input type="checkbox" name="bargainAllowed" defaultChecked className="h-5 w-5 accent-black" />
          </label>

          {state?.error ? (
            <div className="rounded-md bg-[rgba(197,48,48,0.08)] p-3 text-[13px] text-danger">{state.error}</div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 mt-2 bg-bg/90 px-5 py-3 backdrop-blur pb-safe">
            <Button type="submit" variant="accent" size="lg" full loading={pending}>
              Отправить партнёру
            </Button>
            <div className="mt-2 text-center text-[11px] text-muted">
              <Pill variant="ghost" size="sm">
                Резервируем {price} LC на время выполнения
              </Pill>
            </div>
          </div>
        </form>
      </MobileScroll>
    </>
  );
}
