import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { Pill } from "@/components/ui/pill";
import { SpicyConsentToggle } from "../consent";

export const dynamic = "force-dynamic";

export default async function SpicySettingsPage() {
  const { user, pair, partner } = await requirePair();
  const myConsent = await prisma.spicyConsent.findUnique({
    where: { pairId_userId: { pairId: pair.id, userId: user.id } },
  });
  const partnerConsent = partner
    ? await prisma.spicyConsent.findUnique({
        where: { pairId_userId: { pairId: pair.id, userId: partner.user.id } },
      })
    : null;
  return (
    <div data-mode="spicy">
      <TopHeader title="Настройки приватности" backHref="/spicy" />
      <MobileScroll>
        <div className="card p-5">
          <h2 className="h-display text-[16px]">Согласие</h2>
          <p className="mt-1 text-[13px] text-muted">
            Приватный режим работает, только когда оба партнёра включили его. Отозвать согласие можно в любой момент —
            интерфейс сразу скроет спайси-контент.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2.5 text-[13px]">
              <span>Вы</span>
              <Pill variant={myConsent?.enabled ? "success" : "muted"} size="sm">
                {myConsent?.enabled ? "Включено" : "Нет"}
              </Pill>
            </div>
            <div className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2.5 text-[13px]">
              <span>{partner?.user.displayName ?? "Партнёр"}</span>
              <Pill variant={partnerConsent?.enabled ? "success" : "muted"} size="sm">
                {partnerConsent?.enabled ? "Включено" : "Ожидает"}
              </Pill>
            </div>
          </div>
          <div className="mt-4">
            <SpicyConsentToggle enabled={!!myConsent?.enabled} />
          </div>
        </div>

        <div className="mt-4 card-soft p-4 text-[12px] text-muted">
          <div className="font-semibold text-ink">Что это меняет</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Приватные награды/кейсы доступны только здесь</li>
            <li>В главных списках они не показываются</li>
            <li>Пуш-уведомления приходят нейтральными формулировками</li>
          </ul>
        </div>

        <div className="h-4" />
      </MobileScroll>
    </div>
  );
}
