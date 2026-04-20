"use client";
import { useActionState } from "react";
import { AppShell, MobileScroll } from "@/components/app-shell";
import { TopHeader } from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinPairAction } from "@/actions/pair";

export default function JoinPairPage() {
  const [state, action, pending] = useActionState(joinPairAction, null);
  return (
    <AppShell>
      <TopHeader title="Присоединиться" backHref="/pair/create" />
      <MobileScroll>
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-wide text-muted">Шаг 1</div>
          <h1 className="mt-1 h-display text-[28px] leading-tight">Введи код</h1>
          <p className="mt-2 max-w-[32ch] text-[13px] text-muted">
            Партнёр поделится с тобой 8-значным кодом приглашения.
          </p>
        </div>

        <form action={action} className="mt-4 flex flex-col gap-4">
          <Input
            name="code"
            label="Код приглашения"
            placeholder="ABCD1234"
            maxLength={8}
            autoCapitalize="characters"
            className="tracking-[0.3em] text-center uppercase"
            required
          />
          {state?.error ? (
            <div className="rounded-md bg-[rgba(197,48,48,0.08)] p-3 text-[13px] text-danger">
              {state.error}
            </div>
          ) : null}
          <Button type="submit" variant="accent" size="lg" full loading={pending}>
            Присоединиться
          </Button>
        </form>
      </MobileScroll>
    </AppShell>
  );
}
