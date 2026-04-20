"use client";
import { useEffect, useState, useTransition } from "react";
import { Bell, X } from "lucide-react";
import { savePushSubscriptionAction } from "@/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Shown on Home once push is not yet granted.
 * Dismissed permanently via localStorage.
 */
export function PushBanner() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    // Only show if push supported, permission not yet decided, not dismissed before
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem("push-banner-dismissed")) return;
    setShow(true);
  }, []);

  if (!show || done) return null;

  const dismiss = () => {
    localStorage.setItem("push-banner-dismissed", "1");
    setShow(false);
  };

  const enable = () =>
    start(async () => {
      setErr(null);
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          dismiss();
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
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
        setDone(true);
        setShow(false);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Ошибка");
      }
    });

  return (
    <div className="mt-4 flex items-start gap-3 rounded-xl border border-[color:var(--hairline)] bg-surface p-4 shadow-hair">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft">
        <Bell size={18} className="text-accent-ink" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">Включить уведомления</div>
        <div className="mt-0.5 text-[12px] text-muted">
          Узнавай сразу, когда партнёр отправил задачу или ответил.
        </div>
        {err && <div className="mt-1 text-[11px] text-danger">{err}</div>}
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={enable}
            disabled={pending}
            className="rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Подключаем…" : "Включить"}
          </button>
          <button
            onClick={dismiss}
            className="rounded-lg px-3 py-1.5 text-[12px] text-muted"
          >
            Не сейчас
          </button>
        </div>
      </div>
      <button onClick={dismiss} className="-mt-0.5 shrink-0 text-muted2 hover:text-muted">
        <X size={16} />
      </button>
    </div>
  );
}
