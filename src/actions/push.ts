"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function savePushSubscriptionAction(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}) {
  const user = await requireUser();
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: sub.userAgent,
      active: true,
      userId: user.id,
    },
    create: {
      userId: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: sub.userAgent,
    },
  });
  return { ok: true };
}

export async function removePushSubscriptionAction(endpoint: string) {
  const user = await requireUser();
  await prisma.pushSubscription.updateMany({
    where: { endpoint, userId: user.id },
    data: { active: false },
  });
  return { ok: true };
}
