"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Silent service worker registrar — safe to mount in root layout. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);
  return null;
}

/** Install prompt button with beforeinstallprompt handling. */
export function PwaInstaller() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed) {
    return <div className="text-[13px] text-success">Установлено ✓</div>;
  }
  if (!evt) {
    return (
      <div className="text-[12px] text-muted">
        На iOS: поделиться → «На экран домой». На Chrome Android — появится подсказка автоматически.
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="md"
      className="w-full"
      onClick={async () => {
        try {
          await evt.prompt();
          await evt.userChoice;
          setEvt(null);
        } catch {}
      }}
    >
      Установить приложение
    </Button>
  );
}
