"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { creditPersonal, reservePersonal } from "@/lib/wallet";
import { sendNotification } from "@/lib/push";

const createSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(800).optional().nullable(),
  category: z.enum(["HOME", "CARE", "FOOD", "TIME", "SURPRISE", "OTHER", "SPICY"]).default("OTHER"),
  priceLc: z.number().int().min(20).max(500),
  bonusSpeedLc: z.number().int().min(0).max(200).default(0),
  bonusQualityLc: z.number().int().min(0).max(200).default(0),
  deadlineHours: z.number().int().min(1).max(168).optional(),
  urgent: z.boolean().default(false),
  bargainAllowed: z.boolean().default(true),
  onExchange: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
});

export type TaskState = { error?: string } | null;

export async function createTaskAction(_: TaskState, formData: FormData): Promise<TaskState> {
  const { user, pair, partner } = await requirePair();
  if (!partner) return { error: "Второй партнёр ещё не подключился" };

  const data = createSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    category: formData.get("category") || "OTHER",
    priceLc: Number(formData.get("priceLc") || 0),
    bonusSpeedLc: Number(formData.get("bonusSpeedLc") || 0),
    bonusQualityLc: Number(formData.get("bonusQualityLc") || 0),
    deadlineHours: formData.get("deadlineHours") ? Number(formData.get("deadlineHours")) : undefined,
    urgent: formData.get("urgent") === "on",
    bargainAllowed: formData.get("bargainAllowed") !== "off",
    onExchange: formData.get("onExchange") === "on",
    isSpicy: formData.get("isSpicy") === "on",
  });

  if (data.isSpicy && !pair.spicyEnabled) {
    return { error: "Приватный режим не включён обоими" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await reservePersonal(tx, pair.id, user.id, data.priceLc, "TASK_RESERVE", "task");
      await tx.task.create({
        data: {
          pairId: pair.id,
          createdByUserId: user.id,
          assignedToUserId: partner.user.id,
          title: data.title,
          description: data.description ?? undefined,
          category: data.category,
          priceLc: data.priceLc,
          bonusSpeedLc: data.bonusSpeedLc,
          bonusQualityLc: data.bonusQualityLc,
          deadlineAt: data.deadlineHours
            ? new Date(Date.now() + data.deadlineHours * 60 * 60 * 1000)
            : null,
          urgent: data.urgent,
          bargainAllowed: data.bargainAllowed,
          onExchange: data.onExchange,
          isSpicy: data.isSpicy,
          status: "PROPOSED",
          frozenAmountLc: data.priceLc,
        },
      });
    });
  } catch (e) {
    return { error: (e as Error).message };
  }

  await sendNotification(partner.user.id, "TASK_SENT", { pairId: pair.id }, pair.id);
  revalidatePath("/tasks");
  revalidatePath("/home");
  redirect("/tasks");
}

async function loadTask(taskId: string, pairId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, pairId } });
  if (!task) throw new Error("Задача не найдена");
  return task;
}

export async function acceptTaskAction(taskId: string) {
  const { user, pair } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const t = await tx.task.findFirst({ where: { id: taskId, pairId: pair.id } });
    if (!t) throw new Error("Задача не найдена");
    if (t.assignedToUserId !== user.id) throw new Error("Это не твоя задача");
    if (!["PROPOSED", "BARGAINING"].includes(t.status)) throw new Error("Нельзя принять из текущего статуса");
    await tx.task.update({
      where: { id: taskId },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
  });
  const t = await loadTask(taskId, pair.id);
  await sendNotification(t.createdByUserId, "TASK_REPLY", { taskId }, pair.id);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath("/home");
}

export async function declineTaskAction(taskId: string) {
  const { user, pair } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const t = await tx.task.findFirst({ where: { id: taskId, pairId: pair.id } });
    if (!t) throw new Error("Задача не найдена");
    if (t.assignedToUserId !== user.id) throw new Error("Это не твоя задача");
    if (!["PROPOSED", "BARGAINING"].includes(t.status)) throw new Error("Нельзя отклонить");
    if (t.frozenAmountLc > 0) {
      await creditPersonal(tx, pair.id, t.createdByUserId, t.frozenAmountLc, "TASK_RELEASE", "task", t.id);
    }
    await tx.task.update({
      where: { id: taskId },
      data: { status: "CANCELLED", frozenAmountLc: 0 },
    });
  });
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
}

export async function bargainTaskAction(taskId: string, formData: FormData) {
  const { user, pair } = await requirePair();
  const offered = Number(formData.get("priceLc") || 0);
  const message = String(formData.get("message") || "").slice(0, 300);

  await prisma.$transaction(async (tx) => {
    const t = await tx.task.findFirst({
      where: { id: taskId, pairId: pair.id },
      include: { bargainRounds: true },
    });
    if (!t) throw new Error("Задача не найдена");
    if (!t.bargainAllowed) throw new Error("Торг запрещён");
    if (t.assignedToUserId !== user.id) throw new Error("Торг может начать исполнитель");
    if (!["PROPOSED", "BARGAINING"].includes(t.status)) throw new Error("Торг недоступен");
    if (t.bargainRounds.length >= 2) throw new Error("Макс 2 раунда торга");
    const cap = Math.floor(t.priceLc * 1.5);
    if (offered < 20 || offered > cap) throw new Error(`Цена: 20–${cap} LC`);

    await tx.taskBargainRound.create({
      data: { taskId, actorUserId: user.id, offeredPriceLc: offered, message },
    });
    await tx.task.update({ where: { id: taskId }, data: { status: "BARGAINING" } });
  });

  const t = await loadTask(taskId, pair.id);
  await sendNotification(t.createdByUserId, "TASK_REPLY", { taskId }, pair.id);
  revalidatePath(`/tasks/${taskId}`);
}

export async function acceptBargainAction(taskId: string) {
  const { user, pair } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const t = await tx.task.findFirst({
      where: { id: taskId, pairId: pair.id },
      include: { bargainRounds: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!t) throw new Error("Задача не найдена");
    if (t.createdByUserId !== user.id) throw new Error("Принять может создатель");
    if (t.status !== "BARGAINING") throw new Error("Нет активного торга");
    const last = t.bargainRounds[0];
    if (!last) throw new Error("Нет предложений");
    const diff = last.offeredPriceLc - t.priceLc;
    if (diff > 0) {
      await reservePersonal(tx, pair.id, user.id, diff, "TASK_RESERVE", "task", t.id);
    } else if (diff < 0) {
      await creditPersonal(tx, pair.id, user.id, -diff, "TASK_RELEASE", "task", t.id);
    }
    await tx.task.update({
      where: { id: taskId },
      data: {
        priceLc: last.offeredPriceLc,
        frozenAmountLc: last.offeredPriceLc,
        status: "ACCEPTED",
        acceptedAt: new Date(),
        deadlineAt: last.offeredDeadlineAt ?? t.deadlineAt,
      },
    });
  });
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
}

export async function startTaskAction(taskId: string) {
  const { user, pair } = await requirePair();
  await prisma.task.updateMany({
    where: { id: taskId, pairId: pair.id, assignedToUserId: user.id, status: "ACCEPTED" },
    data: { status: "IN_PROGRESS" },
  });
  revalidatePath(`/tasks/${taskId}`);
}

export async function completeTaskAction(taskId: string) {
  const { user, pair } = await requirePair();
  await prisma.task.updateMany({
    where: {
      id: taskId,
      pairId: pair.id,
      assignedToUserId: user.id,
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
    },
    data: { status: "PENDING_CONFIRM", completedAt: new Date() },
  });
  const t = await loadTask(taskId, pair.id);
  await sendNotification(t.createdByUserId, "TASK_REPLY", { taskId }, pair.id);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
}

export async function confirmTaskAction(taskId: string, quality: boolean, speed: boolean) {
  const { user, pair } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const t = await tx.task.findFirst({ where: { id: taskId, pairId: pair.id } });
    if (!t) throw new Error("Задача не найдена");
    if (t.createdByUserId !== user.id) throw new Error("Подтверждает создатель");
    if (t.status !== "PENDING_CONFIRM") throw new Error("Нельзя подтвердить");

    let total = t.frozenAmountLc;
    if (quality && t.bonusQualityLc > 0) {
      await reservePersonal(tx, pair.id, user.id, t.bonusQualityLc, "TASK_BONUS", "task", t.id);
      total += t.bonusQualityLc;
    }
    if (speed && t.bonusSpeedLc > 0) {
      await reservePersonal(tx, pair.id, user.id, t.bonusSpeedLc, "TASK_BONUS", "task", t.id);
      total += t.bonusSpeedLc;
    }
    await creditPersonal(tx, pair.id, t.assignedToUserId, total, "TASK_PAYOUT", "task", t.id);

    await tx.task.update({
      where: { id: taskId },
      data: { status: "CONFIRMED", confirmedAt: new Date(), frozenAmountLc: 0 },
    });
  });
  const t = await loadTask(taskId, pair.id);
  await sendNotification(t.assignedToUserId, "TASK_CONFIRMED", { taskId }, pair.id);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath("/home");
}

export async function disputeTaskAction(taskId: string, reason: string) {
  const { user, pair } = await requirePair();
  await prisma.task.updateMany({
    where: { id: taskId, pairId: pair.id, createdByUserId: user.id, status: "PENDING_CONFIRM" },
    data: { status: "DISPUTED", disputeReason: reason.slice(0, 300) },
  });
  revalidatePath(`/tasks/${taskId}`);
}

export async function cancelTaskAction(taskId: string) {
  const { user, pair } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const t = await tx.task.findFirst({ where: { id: taskId, pairId: pair.id } });
    if (!t) throw new Error("Задача не найдена");
    if (t.createdByUserId !== user.id) throw new Error("Отменить может создатель");
    if (!["DRAFT", "PROPOSED", "BARGAINING"].includes(t.status)) throw new Error("Нельзя отменить");
    if (t.frozenAmountLc > 0) {
      await creditPersonal(tx, pair.id, user.id, t.frozenAmountLc, "TASK_RELEASE", "task", t.id);
    }
    await tx.task.update({
      where: { id: taskId },
      data: { status: "CANCELLED", frozenAmountLc: 0 },
    });
  });
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
}

/** Lazy expiry: callers pass tasks and we auto-expire overdue ones. */
export async function sweepExpired(pairId: string) {
  const now = new Date();
  const overdue = await prisma.task.findMany({
    where: {
      pairId,
      deadlineAt: { lt: now },
      status: { in: ["PROPOSED", "BARGAINING", "ACCEPTED", "IN_PROGRESS"] },
    },
  });
  if (overdue.length === 0) return 0;
  await prisma.$transaction(async (tx) => {
    for (const t of overdue) {
      if (t.frozenAmountLc > 0) {
        await creditPersonal(tx, pairId, t.createdByUserId, t.frozenAmountLc, "TASK_RELEASE", "task", t.id);
      }
      await tx.task.update({
        where: { id: t.id },
        data: { status: "EXPIRED", expiredAt: now, frozenAmountLc: 0 },
      });
    }
  });
  return overdue.length;
}
