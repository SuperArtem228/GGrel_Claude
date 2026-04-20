import "server-only";
import webpush from "web-push";
import { prisma } from "./prisma";
import type { NotificationKind } from "@prisma/client";

const subject = process.env.VAPID_SUBJECT || "mailto:hello@bondgame.dev";
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

const COPY: Record<NotificationKind, { title: string; body: string }> = {
  TASK_SENT: { title: "Новая задача", body: "Партнёр отправил тебе задачу" },
  TASK_REPLY: { title: "Ответ по задаче", body: "Партнёр ответил на задачу" },
  TASK_CONFIRMED: { title: "Задача подтверждена", body: "Задача подтверждена, LC зачислены" },
  STREAK_RISK: { title: "Серия под риском", body: "Сегодня ещё нет прогресса" },
  REWARD_ACTIVATED: { title: "Награда активирована", body: "Партнёр активировал награду" },
  CASE_RESULT: { title: "Кейс открыт", body: "Результат кейса доступен" },
  SPICY_NEUTRAL: { title: "Приватное обновление", body: "У вас есть приватное обновление" },
};

export async function sendNotification(
  userId: string,
  kind: NotificationKind,
  payload?: Record<string, unknown>,
  pairId?: string,
) {
  const copy = COPY[kind];
  const log = await prisma.notificationLog.create({
    data: {
      userId,
      pairId,
      kind,
      title: copy.title,
      body: copy.body,
      payloadJson: payload ? JSON.stringify(payload) : null,
      status: "QUEUED",
    },
  });

  if (!publicKey || !privateKey) {
    return { queued: true, sent: 0, logId: log.id };
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId, active: true },
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title: copy.title, body: copy.body, ...payload }),
      );
      sent++;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        await prisma.pushSubscription.update({ where: { id: sub.id }, data: { active: false } });
      }
    }
  }

  await prisma.notificationLog.update({
    where: { id: log.id },
    data: { status: sent > 0 ? "SENT" : "FAILED", sentAt: new Date() },
  });

  return { queued: false, sent, logId: log.id };
}
