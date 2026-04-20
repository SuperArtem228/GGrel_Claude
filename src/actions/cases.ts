"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { openCaseAtomic } from "@/lib/cases";
import { sendNotification } from "@/lib/push";

const createCaseSchema = z.object({
  title: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional().nullable(),
  openPriceLc: z.number().int().min(40).max(600),
  isSpicy: z.boolean().default(false),
  emoji: z.string().max(4).optional().nullable(),
  items: z
    .array(
      z.object({
        rewardTemplateId: z.string(),
        probabilityPercent: z.number().int().min(1).max(95),
      }),
    )
    .min(3)
    .max(8),
});

export type CaseState = { error?: string; id?: string } | null;

export async function createCaseAction(_: CaseState, formData: FormData): Promise<CaseState> {
  const { user, pair } = await requirePair();
  let data: z.infer<typeof createCaseSchema>;
  try {
    const raw = JSON.parse(String(formData.get("payload") || "{}"));
    data = createCaseSchema.parse(raw);
  } catch {
    return { error: "Некорректные данные кейса" };
  }
  if (data.isSpicy && !pair.spicyEnabled) return { error: "Приватный режим не включён" };
  const total = data.items.reduce((s, i) => s + i.probabilityPercent, 0);
  if (total !== 100) return { error: "Сумма вероятностей должна быть 100%" };

  // verify reward ownership/compatibility
  const ids = data.items.map((i) => i.rewardTemplateId);
  const rewards = await prisma.rewardTemplate.findMany({ where: { id: { in: ids } } });
  if (rewards.length !== ids.length) return { error: "Не все награды найдены" };
  for (const r of rewards) {
    if (r.isSpicy && !data.isSpicy) return { error: "Спайси-награда только в спайси-кейсе" };
  }

  const created = await prisma.caseTemplate.create({
    data: {
      createdByUserId: user.id,
      pairId: pair.id,
      title: data.title,
      description: data.description ?? undefined,
      openPriceLc: data.openPriceLc,
      isSpicy: data.isSpicy,
      isSystem: false,
      emoji: data.emoji ?? undefined,
      items: {
        create: data.items.map((it, idx) => ({
          rewardTemplateId: it.rewardTemplateId,
          probabilityPercent: it.probabilityPercent,
          sortOrder: idx,
        })),
      },
    },
  });
  revalidatePath("/shop");
  if (data.isSpicy) redirect("/spicy/cases");
  redirect(`/shop/cases/${created.id}`);
}

export async function openCaseAction(caseTemplateId: string) {
  const { user, pair, partner } = await requirePair();
  const res = await openCaseAtomic({ pairId: pair.id, userId: user.id, caseTemplateId });
  if (partner) {
    await sendNotification(
      partner.user.id,
      res.rewardTemplate.isSpicy ? "SPICY_NEUTRAL" : "CASE_RESULT",
      { caseId: caseTemplateId },
      pair.id,
    );
  }
  revalidatePath("/shop");
  revalidatePath("/shop/my");
  revalidatePath("/home");
  return res;
}
