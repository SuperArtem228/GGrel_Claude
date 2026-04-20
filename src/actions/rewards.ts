"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { creditPersonal, reservePersonal } from "@/lib/wallet";
import { sendNotification } from "@/lib/push";

const customRewardSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional().nullable(),
  category: z.enum(["ACTION", "INSTANT", "PRIVATE"]).default("ACTION"),
  priceLc: z.number().int().min(40).max(600),
  isSpicy: z.boolean().default(false),
  emoji: z.string().max(4).optional().nullable(),
});

export type RewardState = { error?: string } | null;

export async function createCustomRewardAction(_: RewardState, formData: FormData): Promise<RewardState> {
  const { user, pair } = await requirePair();
  const data = customRewardSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    category: formData.get("category") || "ACTION",
    priceLc: Number(formData.get("priceLc") || 0),
    isSpicy: formData.get("isSpicy") === "on",
    emoji: formData.get("emoji") || null,
  });
  if (data.isSpicy && !pair.spicyEnabled) return { error: "Приватный режим не включён" };

  await prisma.rewardTemplate.create({
    data: {
      createdByUserId: user.id,
      pairId: pair.id,
      title: data.title,
      description: data.description ?? undefined,
      category: data.category,
      priceLc: data.priceLc,
      isSpicy: data.isSpicy,
      emoji: data.emoji ?? undefined,
      isSystem: false,
    },
  });
  revalidatePath("/shop");
  if (data.isSpicy) redirect("/spicy/rewards");
  redirect("/shop");
}

export async function buyRewardAction(rewardTemplateId: string, forPartner: boolean) {
  const { user, pair, partner } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const tpl = await tx.rewardTemplate.findUnique({ where: { id: rewardTemplateId } });
    if (!tpl || !tpl.active) throw new Error("Награда недоступна");
    if (tpl.isSpicy && !pair.spicyEnabled) throw new Error("Приватный режим не включён");

    await reservePersonal(tx, pair.id, user.id, tpl.priceLc, "REWARD_PURCHASE", "reward", tpl.id);

    const ownerId = forPartner && partner ? partner.user.id : user.id;

    await tx.ownedReward.create({
      data: {
        pairId: pair.id,
        rewardTemplateId: tpl.id,
        ownerUserId: ownerId,
        purchasedByUserId: user.id,
        status: "OWNED",
        sourceType: "STORE",
        privateFlag: tpl.isSpicy,
      },
    });
  });
  revalidatePath("/shop");
  revalidatePath("/shop/my");
  revalidatePath("/home");
}

export async function activateRewardAction(ownedRewardId: string) {
  const { user, pair, partner } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const o = await tx.ownedReward.findFirst({ where: { id: ownedRewardId, pairId: pair.id } });
    if (!o) throw new Error("Награда не найдена");
    if (o.ownerUserId !== user.id) throw new Error("Не твоя награда");
    if (o.status !== "OWNED") throw new Error("Нельзя активировать");
    await tx.ownedReward.update({
      where: { id: o.id },
      data: { status: "ACTIVATED", activatedAt: new Date() },
    });
  });
  if (partner) {
    await sendNotification(partner.user.id, "REWARD_ACTIVATED", { rewardId: ownedRewardId }, pair.id);
  }
  revalidatePath("/shop/my");
}

export async function fulfillRewardAction(ownedRewardId: string) {
  const { user, pair } = await requirePair();
  await prisma.ownedReward.updateMany({
    where: { id: ownedRewardId, pairId: pair.id, purchasedByUserId: user.id, status: "ACTIVATED" },
    data: { status: "FULFILLED", fulfilledAt: new Date() },
  });
  revalidatePath("/shop/my");
}
