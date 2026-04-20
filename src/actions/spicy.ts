"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { recomputeSpicyEnabled } from "@/lib/pair";
import { sendNotification } from "@/lib/push";

export async function setSpicyConsentAction(enabled: boolean) {
  const { user, pair, partner } = await requirePair();
  await prisma.$transaction(async (tx) => {
    await tx.spicyConsent.upsert({
      where: { pairId_userId: { pairId: pair.id, userId: user.id } },
      update: { enabled },
      create: { pairId: pair.id, userId: user.id, enabled },
    });
    await tx.pairMember.update({
      where: { pairId_userId: { pairId: pair.id, userId: user.id } },
      data: { spicyOptIn: enabled },
    });
  });
  const wasEnabled = pair.spicyEnabled;
  const nowEnabled = await recomputeSpicyEnabled(pair.id);
  if (!wasEnabled && nowEnabled && partner) {
    await sendNotification(partner.user.id, "SPICY_NEUTRAL", {}, pair.id);
  }
  revalidatePath("/spicy");
  revalidatePath("/profile/settings");
  return { enabled, pairEnabled: nowEnabled };
}
