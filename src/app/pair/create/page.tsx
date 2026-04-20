"use client";
import { useActionState } from "react";
import Link from "next/link";
import { AppShell, MobileScroll } from "@/components/app-shell";
import { TopHeader } from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPairAction } from "@/actions/pair";

export default function CreatePairPage() {
  const [state, action, pending] = useActionState(createPairAction, null);
  return (
    <AppShell>
      <TopHeader title="Ваша пара" backHref="/welcome" />
      <MobileScroll>
        <div className="card relative overflow-hidden p-5">
          <div className="lime-blob absolute -right-8 -top-8 h-32 w-32" />
          <div className="relative z-10">
            <div className="text-[11px] uppercase tracking-wide text-muted">Шаг 1</div>
            <h1 className="mt-1 h-display text-[28px] leading-tight">Создай пару</h1>
            <p className="mt-2 max-w-[32ch] text-[13px] text-muted">
              После создания мы выдадим код приглашения — поделись им со вторым партнёром.
            </p>
          </div>
        </div>

        <form action={action} className="mt-4 flex flex-col gap-4">
          <Input
            name="name"
            label="Название пары"
            placeholder="Артём & Маша"
            maxLength={40}
          />
          {state?.error ? (
            <div className="rounded-md bg-[rgba(197,48,48,0.08)] p-3 text-[13px] text-danger">
              {state.error}
            </div>
          ) : null}
          <Button type="submit" variant="accent" size="lg" full loading={pending}>
            Создать и получить код
          </Button>
        </form>

        <div className="mt-6 text-center text-[13px] text-muted">
          Партнёр уже создал пару?{" "}
          <Link href="/pair/join" className="font-medium text-ink">
            Ввести код
          </Link>
        </div>
      </MobileScroll>
    </AppShell>
  );
}
