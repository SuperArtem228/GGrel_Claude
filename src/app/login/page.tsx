"use client";
import { useActionState } from "react";
import Link from "next/link";
import { AppShell, MobileScroll } from "@/components/app-shell";
import { TopHeader } from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signInAction, null);
  return (
    <AppShell>
      <TopHeader title="Войти" backHref="/welcome" />
      <MobileScroll>
        <form action={action} className="mt-2 flex flex-col gap-4">
          <Input name="email" type="email" label="Email" placeholder="you@bondgame.dev" required autoFocus />
          <Input name="password" type="password" label="Пароль" required />
          {state?.error ? (
            <div className="rounded-md bg-[rgba(197,48,48,0.08)] p-3 text-[13px] text-danger">
              {state.error}
            </div>
          ) : null}
          <Button type="submit" variant="accent" size="lg" full loading={pending}>
            Войти
          </Button>
          <p className="text-center text-[12px] text-muted">
            Ещё нет аккаунта?{" "}
            <Link href="/signup" className="font-medium text-ink">
              Создать
            </Link>
          </p>
          <div className="mt-4 rounded-md bg-surface-alt p-3 text-[12px] text-muted">
            <div className="mb-1 font-medium text-ink">Демо-аккаунты:</div>
            artem@bondgame.dev / bond2026
            <br />
            masha@bondgame.dev / bond2026
          </div>
        </form>
      </MobileScroll>
    </AppShell>
  );
}
