import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { AppShell, MobileScroll } from "@/components/app-shell";
import { TopHeader } from "@/components/top-header";
import { BondFace } from "@/components/bond-mark";
import { Pill } from "@/components/ui/pill";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { WaitingPoller } from "./poller";

export default async function WaitingPage() {
  const user = await requireUser();
  const member = await prisma.pairMember.findFirst({
    where: { userId: user.id },
    include: { pair: { include: { invites: { orderBy: { createdAt: "desc" }, take: 1 } } } },
  });
  if (!member) redirect("/pair/create");
  if (member.pair.status === "ACTIVE") redirect("/home");
  const code = member.pair.invites[0]?.code ?? "—";

  return (
    <AppShell>
      <TopHeader title="Ждём партнёра" />
      <MobileScroll>
        <div className="relative overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-surface p-6 text-center dotty">
          <div className="lime-blob absolute -right-8 -top-8 h-40 w-40" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <BondFace size={64} />
            <Pill variant="accent-soft" size="lg">
              Пара готовится
            </Pill>
            <h1 className="h-display text-[28px] leading-tight">
              Поделись кодом
              <br />с партнёром
            </h1>

            <div className="mt-3 rounded-xl border border-[color:var(--hairline-strong)] bg-surface-alt px-5 py-4">
              <div className="text-[11px] uppercase tracking-wide text-muted">Код приглашения</div>
              <div className="mt-1 font-mono text-[32px] font-bold tracking-[0.3em]">{code}</div>
            </div>

            <p className="max-w-[32ch] text-[13px] text-muted">
              Мы ждём, пока партнёр введёт этот код. Как только он войдёт — вы оба попадёте в общий дом.
            </p>
          </div>
        </div>

        <WaitingPoller />

        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="ghost" size="md" full>
            Выйти из аккаунта
          </Button>
        </form>
      </MobileScroll>
    </AppShell>
  );
}
