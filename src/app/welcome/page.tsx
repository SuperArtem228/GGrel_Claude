import Link from "next/link";
import { BondFace, BondMark } from "@/components/bond-mark";
import { Button } from "@/components/ui/button";
import { AppShell, MobileScroll } from "@/components/app-shell";

export default function WelcomePage() {
  return (
    <AppShell>
      <MobileScroll className="pt-safe">
        <div className="relative flex flex-1 flex-col justify-between py-6">
          <div className="flex items-center gap-2 py-2">
            <BondMark size={28} color="var(--ink)" accent="var(--accent)" />
            <span className="text-[15px] font-semibold tracking-tight">BondGame</span>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-surface p-6 dotty">
            <div className="lime-blob absolute -right-10 -top-10 h-40 w-40" />
            <div className="relative z-10 flex flex-col items-start gap-4">
              <BondFace size={72} />
              <h1 className="h-display text-[40px] leading-[1.02]">
                Мягкая игра
                <br />
                для двоих.
              </h1>
              <p className="max-w-[32ch] text-[15px] text-muted">
                Задачи друг для друга, челленджи, Love Coins и маленькие награды — чтобы делать больше
                хорошего вместе.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2.5">
            <Link href="/signup">
              <Button variant="accent" size="lg" full>
                Создать аккаунт
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" full>
                У меня уже есть аккаунт
              </Button>
            </Link>
            <p className="mt-2 text-center text-[11px] text-muted">
              Продолжая, вы соглашаетесь с мягкими правилами пары.
            </p>
          </div>
        </div>
      </MobileScroll>
    </AppShell>
  );
}
