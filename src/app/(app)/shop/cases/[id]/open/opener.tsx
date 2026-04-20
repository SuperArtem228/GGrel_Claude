"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coin } from "@/components/bond-mark";
import { Pill } from "@/components/ui/pill";
import { formatLC, cn } from "@/lib/utils";
import { openCaseAction } from "@/actions/cases";

type Item = {
  id: string;
  title: string;
  emoji?: string | null;
  isSpicy: boolean;
  priceLc: number;
  probabilityPercent: number;
};

type Result = {
  title: string;
  emoji?: string | null;
  priceLc: number;
  isSpicy: boolean;
  probability: number;
};

export function CaseOpener({
  id,
  title,
  emoji,
  isSpicy,
  openPriceLc,
  items,
}: {
  id: string;
  title: string;
  emoji?: string | null;
  isSpicy: boolean;
  openPriceLc: number;
  items: Item[];
}) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const start = async () => {
    setErr(null);
    setPhase("spinning");
    try {
      const res = await openCaseAction(id);
      // Animate for a short moment for delight, then reveal
      await new Promise((r) => setTimeout(r, 1600));
      setResult({
        title: res.rewardTemplate.title,
        emoji: res.rewardTemplate.emoji,
        priceLc: res.rewardTemplate.priceLc,
        isSpicy: res.rewardTemplate.isSpicy,
        probability: res.probability,
      });
      setPhase("revealed");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось открыть кейс");
      setPhase("idle");
    }
  };

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18 }}
          className={cn(
            "flex h-44 w-44 items-center justify-center rounded-2xl text-[84px] shadow-card",
            isSpicy ? "bg-magenta-soft" : "bg-accent-soft",
          )}
        >
          {emoji || "🎁"}
        </motion.div>
        <div className="text-center">
          <div className="h-display text-[22px]">{title}</div>
          <div className="mt-1 flex items-center justify-center gap-1 text-[14px] text-muted">
            <Coin size={12} /> {formatLC(openPriceLc)} LC за открытие
          </div>
        </div>
        {err ? <p className="text-[12px] text-danger">{err}</p> : null}
        <Button variant="accent" size="lg" className="w-full max-w-[320px]" onClick={start}>
          Открыть
        </Button>
        <p className="max-w-[32ch] text-center text-[12px] text-muted">
          Вероятности честные — шанс пропорционален весу каждой награды в кейсе
        </p>
      </div>
    );
  }

  if (phase === "spinning") {
    return (
      <div className="relative flex flex-col items-center gap-5 py-8">
        <div className="relative h-36 w-full max-w-[360px] overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-surface">
          <motion.div
            className="flex h-full items-center gap-3 px-3"
            initial={{ x: 0 }}
            animate={{ x: -1200 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {Array.from({ length: 28 }).map((_, i) => {
              const it = items[i % items.length];
              return (
                <div
                  key={i}
                  className={cn(
                    "flex h-[112px] w-[112px] shrink-0 flex-col items-center justify-center rounded-lg text-[44px]",
                    it.isSpicy ? "bg-magenta-soft" : "bg-accent-soft",
                  )}
                >
                  {it.emoji || "🎁"}
                </div>
              );
            })}
          </motion.div>
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink/40" />
        </div>
        <div className="h-display text-[16px]">Выпадает…</div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 16 }}
        className="flex flex-col items-center gap-4 py-6"
      >
        <motion.div
          initial={{ rotate: -6, y: 20, opacity: 0 }}
          animate={{ rotate: 0, y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={cn(
            "flex h-48 w-48 items-center justify-center rounded-2xl text-[96px] shadow-lift",
            result.isSpicy ? "bg-magenta-soft" : "bg-accent-soft",
          )}
        >
          {result.emoji || "🎁"}
        </motion.div>
        <div className="text-center">
          <Pill variant={result.probability < 20 ? "accent" : "muted"} size="sm">
            Шанс {result.probability}%
          </Pill>
          <h2 className="mt-2 h-display text-[24px] leading-tight">{result.title}</h2>
          <div className="mt-1 flex items-center justify-center gap-1 text-[14px] font-semibold">
            <Coin size={12} /> {formatLC(result.priceLc)} LC
          </div>
        </div>
        <div className="flex w-full max-w-[320px] flex-col gap-2">
          <Link href="/shop/my" className="block">
            <Button variant="accent" size="lg" className="w-full">
              В мои награды
            </Button>
          </Link>
          <Link href="/shop?tab=cases" className="block">
            <Button variant="ghost" size="md" className="w-full">
              К кейсам
            </Button>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
