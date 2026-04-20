"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setSpicyConsentAction } from "@/actions/spicy";

export function SpicyConsentToggle({ enabled }: { enabled: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      {err ? <p className="mb-2 text-[12px] text-danger">{err}</p> : null}
      <Button
        variant={enabled ? "ghost" : "accent"}
        size="md"
        className="w-full"
        loading={pending}
        onClick={() =>
          start(async () => {
            setErr(null);
            try {
              await setSpicyConsentAction(!enabled);
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Не удалось");
            }
          })
        }
      >
        {enabled ? "Отозвать согласие" : "Я согласен(на) включить"}
      </Button>
    </div>
  );
}
