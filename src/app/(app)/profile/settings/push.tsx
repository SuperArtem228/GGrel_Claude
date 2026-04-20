"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { savePushSubscriptionAction, removePushSubscriptionAction } from "@/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = typeof window !== "undefined" ? window.atob(base64) : "";
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushToggle({ hasSubscription }: { hasSubscription: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [state, setState] = useState<"on" | "off">(hasSubscription ? "on" : "off");

  const enable = () =>
    start(async () => {
      setErr(null);
      try {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          setErr("Браузер не поддерживает пуш-уведомления");
          return;
        }
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setErr("Разрешение на уведомления не выдано");
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
        if (!vapid) {
          setErr("VAPID ключ не настроен");
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        });
        const json = sub.toJSON();
        await savePushSubscriptionAction({
          endpoint: json.endpoint!,
          keys: { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! },
          userAgent: navigator.userAgent,
        });
        setState("on");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Не удалось включить");
      }
    });

  const disable = () =>
    start(async () => {
      setErr(null);
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const endpoint = sub.endpoint;
          await sub.unsubscribe();
          await removePushSubscriptionAction(endpoint);
        }
        setState("off");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Не удалось выключить");
      }
    });

  return (
    <div>
      {err ? <p className="mb-2 text-[12px] text-danger">{err}</p> : null}
      {state === "on" ? (
        <Button variant="ghost" size="md" className="w-full" loading={pending} onClick={disable}>
          Выключить уведомления
        </Button>
      ) : (
        <Button variant="primary" size="md" className="w-full" loading={pending} onClick={enable}>
          Включить уведомления
        </Button>
      )}
    </div>
  );
}
