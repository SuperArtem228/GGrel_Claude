import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLC(n: number) {
  return n.toLocaleString("ru-RU");
}

export function dailyPeriodKey(d: Date = new Date(), tz: string = "Europe/Moscow") {
  const local = new Date(d.toLocaleString("en-US", { timeZone: tz }));
  return local.toISOString().slice(0, 10);
}

export function weeklyPeriodKey(d: Date = new Date(), tz: string = "Europe/Moscow") {
  const local = new Date(d.toLocaleString("en-US", { timeZone: tz }));
  const date = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((+date - +yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function timeAgoRu(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return "только что";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} д назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function timeLeftRu(deadline: Date | string | null | undefined): string | null {
  if (!deadline) return null;
  const date = typeof deadline === "string" ? new Date(deadline) : deadline;
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "истекло";
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) {
    const m = Math.floor(diffMs / 60_000);
    return `${m} мин`;
  }
  if (h < 24) return `${h} ч`;
  const d = Math.floor(h / 24);
  return `${d} д`;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Crypto-secure 0..1 float for weighted draws */
export function secureRandom(): number {
  const buf = new Uint32Array(1);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
  return Math.random();
}
