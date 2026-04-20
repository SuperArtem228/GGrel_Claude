"use client";
import { useActionState } from "react";
import Link from "next/link";
import { AppShell, MobileScroll } from "@/components/app-shell";
import { TopHeader } from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAction } from "@/actions/auth";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUpAction, null);
  return (
    <AppShell>
      <TopHeader title="Создать аккаунт" backHref="/welcome" />
      <MobileScroll>
        <form action={action} className="mt-2 flex flex-col gap-4">
          <Input name="displayName" label="Как тебя зовут?" placeholder="Артём" required autoFocus />
          <Input name="email" type="email" label="Email" placeholder="you@bondgame.dev" required />
          <Input name="password" type="password" label="Пароль" minLength={6} required />
          {state?.error ? (
            <div className="rounded-md bg-[rgba(197,48,48,0.08)] p-3 text-[13px] text-danger">
              {state.error}
            </div>
          ) : null}
          <Button type="submit" variant="accent" size="lg" full loading={pending}>
            Продолжить
          </Button>
          <p className="text-center text-[12px] text-muted">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-ink">
              Войти
            </Link>
          </p>
        </form>
      </MobileScroll>
    </AppShell>
  );
}
