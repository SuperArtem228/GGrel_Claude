"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { TaskStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Input, Textarea } from "@/components/ui/input";
import {
  acceptBargainAction,
  acceptTaskAction,
  bargainTaskAction,
  cancelTaskAction,
  completeTaskAction,
  confirmTaskAction,
  declineTaskAction,
  disputeTaskAction,
  startTaskAction,
} from "@/actions/tasks";

export function TaskActions({
  taskId,
  status,
  iAmAssignee,
  iAmCreator,
  bargainAllowed,
  basePrice,
  bonusSpeedLc,
  bonusQualityLc,
  bargainRoundsUsed,
}: {
  taskId: string;
  status: TaskStatus;
  iAmAssignee: boolean;
  iAmCreator: boolean;
  bargainAllowed: boolean;
  basePrice: number;
  bonusSpeedLc: number;
  bonusQualityLc: number;
  bargainRoundsUsed: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState<null | "bargain" | "dispute" | "confirm">(null);
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<unknown>) {
    setError(null);
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="mt-4 space-y-3">
      {error && (
        <div className="rounded-md bg-[rgba(197,48,48,0.08)] p-3 text-[13px] text-danger">{error}</div>
      )}

      {iAmAssignee && (status === "PROPOSED" || status === "BARGAINING") && (
        <>
          <Button variant="accent" size="lg" full onClick={() => run(() => acceptTaskAction(taskId))} loading={pending}>
            Принять задачу
          </Button>
          <div className="grid grid-cols-2 gap-2">
            {bargainAllowed && bargainRoundsUsed < 2 && (
              <Button variant="ghost" onClick={() => setSheet("bargain")} disabled={pending}>
                Поторговаться
              </Button>
            )}
            <Button variant="soft" onClick={() => run(() => declineTaskAction(taskId))} loading={pending}>
              Отклонить
            </Button>
          </div>
        </>
      )}

      {iAmCreator && status === "BARGAINING" && (
        <Button variant="accent" size="lg" full onClick={() => run(() => acceptBargainAction(taskId))} loading={pending}>
          Принять новое предложение
        </Button>
      )}

      {iAmAssignee && status === "ACCEPTED" && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="primary" onClick={() => run(() => startTaskAction(taskId))} loading={pending}>
            Начать
          </Button>
          <Button variant="accent" onClick={() => run(() => completeTaskAction(taskId))} loading={pending}>
            Я сделал(а)
          </Button>
        </div>
      )}

      {iAmAssignee && status === "IN_PROGRESS" && (
        <Button variant="accent" size="lg" full onClick={() => run(() => completeTaskAction(taskId))} loading={pending}>
          Отметить выполненным
        </Button>
      )}

      {iAmCreator && status === "PENDING_CONFIRM" && (
        <>
          <Button variant="accent" size="lg" full onClick={() => setSheet("confirm")} disabled={pending}>
            Подтвердить
          </Button>
          <Button variant="ghost" full onClick={() => setSheet("dispute")} disabled={pending}>
            Спор
          </Button>
        </>
      )}

      {iAmCreator && (status === "PROPOSED" || status === "BARGAINING") && (
        <Button variant="soft" full onClick={() => run(() => cancelTaskAction(taskId))} loading={pending}>
          Отменить задачу
        </Button>
      )}

      {status === "CONFIRMED" && (
        <div className="card p-4 text-center text-[13px] text-muted">
          <Pill variant="success">Подтверждена</Pill>
          <p className="mt-2">Спасибо за игру.</p>
        </div>
      )}

      <AnimatePresence>
        {sheet === "bargain" && (
          <BargainSheet
            onClose={() => setSheet(null)}
            onSubmit={(price, message) =>
              run(() =>
                bargainTaskAction(taskId, formData({ priceLc: String(price), message })),
              )
            }
            defaultPrice={Math.min(Math.floor(basePrice * 1.2), Math.floor(basePrice * 1.5))}
            maxPrice={Math.floor(basePrice * 1.5)}
          />
        )}
        {sheet === "dispute" && (
          <SimpleSheet
            title="Спор"
            description="Опиши, что не так. Партнёр получит уведомление."
            onClose={() => setSheet(null)}
            onSubmit={(text) => run(() => disputeTaskAction(taskId, text))}
            cta="Открыть спор"
          />
        )}
        {sheet === "confirm" && (
          <ConfirmSheet
            onClose={() => setSheet(null)}
            onSubmit={(quality, speed) => run(() => confirmTaskAction(taskId, quality, speed))}
            bonusSpeedLc={bonusSpeedLc}
            bonusQualityLc={bonusQualityLc}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function formData(obj: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj)) fd.set(k, v);
  return fd;
}

function BargainSheet({
  onClose,
  onSubmit,
  defaultPrice,
  maxPrice,
}: {
  onClose: () => void;
  onSubmit: (price: number, message: string) => void;
  defaultPrice: number;
  maxPrice: number;
}) {
  const [price, setPrice] = useState(defaultPrice);
  const [message, setMessage] = useState("");
  return (
    <Sheet onClose={onClose}>
      <h3 className="h-display text-[20px]">Предложи свою цену</h3>
      <p className="mt-1 text-[13px] text-muted">Макс {maxPrice} LC. Партнёр решит, принять или нет.</p>
      <div className="mt-4">
        <Input
          type="number"
          value={price}
          min={20}
          max={maxPrice}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
          label="Цена, LC"
        />
      </div>
      <div className="mt-3">
        <Textarea
          placeholder="Комментарий (опционально)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          label="Комментарий"
          maxLength={300}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="accent" onClick={() => { onSubmit(price, message); onClose(); }}>
          Отправить
        </Button>
      </div>
    </Sheet>
  );
}

function SimpleSheet({
  title,
  description,
  onClose,
  onSubmit,
  cta,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
  cta: string;
}) {
  const [text, setText] = useState("");
  return (
    <Sheet onClose={onClose}>
      <h3 className="h-display text-[20px]">{title}</h3>
      <p className="mt-1 text-[13px] text-muted">{description}</p>
      <div className="mt-4">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={300} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="accent" onClick={() => { onSubmit(text); onClose(); }}>
          {cta}
        </Button>
      </div>
    </Sheet>
  );
}

function ConfirmSheet({
  onClose,
  onSubmit,
  bonusSpeedLc,
  bonusQualityLc,
}: {
  onClose: () => void;
  onSubmit: (quality: boolean, speed: boolean) => void;
  bonusSpeedLc: number;
  bonusQualityLc: number;
}) {
  const [quality, setQuality] = useState(bonusQualityLc > 0);
  const [speed, setSpeed] = useState(bonusSpeedLc > 0);
  return (
    <Sheet onClose={onClose}>
      <h3 className="h-display text-[20px]">Подтвердить задачу</h3>
      <p className="mt-1 text-[13px] text-muted">Выбери, дать ли бонусы.</p>
      <div className="mt-4 space-y-2">
        {bonusQualityLc > 0 && (
          <label className="flex items-center justify-between rounded-md border border-[color:var(--hairline)] bg-surface p-3">
            <div>
              <div className="text-[14px] font-medium">Качественно сделано</div>
              <div className="text-[12px] text-muted">+{bonusQualityLc} LC</div>
            </div>
            <input type="checkbox" checked={quality} onChange={(e) => setQuality(e.target.checked)} className="h-5 w-5 accent-black" />
          </label>
        )}
        {bonusSpeedLc > 0 && (
          <label className="flex items-center justify-between rounded-md border border-[color:var(--hairline)] bg-surface p-3">
            <div>
              <div className="text-[14px] font-medium">Быстро</div>
              <div className="text-[12px] text-muted">+{bonusSpeedLc} LC</div>
            </div>
            <input type="checkbox" checked={speed} onChange={(e) => setSpeed(e.target.checked)} className="h-5 w-5 accent-black" />
          </label>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="accent" onClick={() => { onSubmit(quality, speed); onClose(); }}>
          Подтвердить
        </Button>
      </div>
    </Sheet>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-mobile rounded-t-2xl bg-surface p-5 pb-safe shadow-lift"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color:var(--hairline-strong)]" />
        {children}
      </motion.div>
    </>
  );
}
