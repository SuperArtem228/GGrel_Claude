"use client";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";
import { useTransition } from "react";

export function SignOutButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="md"
      className="w-full text-danger"
      loading={pending}
      onClick={() => start(async () => await signOutAction())}
    >
      Выйти из аккаунта
    </Button>
  );
}
