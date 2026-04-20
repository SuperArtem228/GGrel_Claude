"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePair } from "@/lib/session";
import { creditPersonal } from "@/lib/wallet";
import { dailyPeriodKey, weeklyPeriodKey } from "@/lib/utils";

export async function selectDailyChallengesAction(templateIds: string[]) {
  const { pair } = await requirePair();
  const periodKey = dailyPeriodKey(new Date(), pair.timezone);
  await prisma.$transaction(async (tx) => {
    for (const tplId of templateIds.slice(0, 3)) {
      await tx.pairChallenge.upsert({
        where: { pairId_templateId_periodKey: { pairId: pair.id, templateId: tplId, periodKey } },
        update: { status: "SELECTED" },
        create: {
          pairId: pair.id,
          templateId: tplId,
          periodKey,
          status: "SELECTED",
          startedAt: new Date(),
        },
      });
    }
  });
  revalidatePath("/challenges");
  revalidatePath("/home");
}

export async function completeChallengeStepAction(pairChallengeId: string) {
  const { user, pair, me, partner } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const pc = await tx.pairChallenge.findFirst({
      where: { id: pairChallengeId, pairId: pair.id },
      include: { template: true },
    });
    if (!pc) throw new Error("Челлендж не найден");
    const field = me.role === "A" ? "progressUserA" : "progressUserB";
    const current = me.role === "A" ? pc.progressUserA : pc.progressUserB;
    if (current >= pc.template.totalSteps) return;

    const updates: Partial<{ progressUserA: number; progressUserB: number; status: "IN_PROGRESS" | "DONE" }> = {
      [field]: current + 1,
    } as { progressUserA?: number; progressUserB?: number };

    const newA = me.role === "A" ? current + 1 : pc.progressUserA;
    const newB = me.role === "B" ? current + 1 : pc.progressUserB;

    let done = false;
    if (pc.template.requiresBoth) {
      if (newA >= pc.template.totalSteps && newB >= pc.template.totalSteps) done = true;
    } else {
      if (newA >= pc.template.totalSteps || newB >= pc.template.totalSteps) done = true;
    }
    updates.status = done ? "DONE" : "IN_PROGRESS";

    await tx.pairChallenge.update({
      where: { id: pairChallengeId },
      data: { ...updates, completedAt: done ? new Date() : null },
    });
  });
  revalidatePath("/challenges");
  revalidatePath("/home");
  return { partnerId: partner?.user.id };
}

export async function claimChallengeRewardAction(pairChallengeId: string) {
  const { pair, me } = await requirePair();
  await prisma.$transaction(async (tx) => {
    const pc = await tx.pairChallenge.findFirst({
      where: { id: pairChallengeId, pairId: pair.id },
      include: { template: true },
    });
    if (!pc) throw new Error("Челлендж не найден");
    if (pc.status !== "DONE") throw new Error("Ещё не завершён");
    if (pc.rewardClaimed) throw new Error("Награда уже получена");

    if (pc.template.requiresBoth) {
      // split 50/50 → round up to A
      const half = Math.ceil(pc.template.rewardLc / 2);
      const other = pc.template.rewardLc - half;
      const members = await tx.pairMember.findMany({ where: { pairId: pair.id } });
      const memA = members.find((m) => m.role === "A");
      const memB = members.find((m) => m.role === "B");
      if (memA) await creditPersonal(tx, pair.id, memA.userId, half, "CHALLENGE_REWARD", "challenge", pc.id);
      if (memB) await creditPersonal(tx, pair.id, memB.userId, other, "CHALLENGE_REWARD", "challenge", pc.id);
    } else {
      await creditPersonal(tx, pair.id, me.userId, pc.template.rewardLc, "CHALLENGE_REWARD", "challenge", pc.id);
    }
    await tx.pairChallenge.update({
      where: { id: pc.id },
      data: { rewardClaimed: true, status: "CLAIMED" },
    });
  });
  revalidatePath("/challenges");
  revalidatePath("/home");
}

export async function getOrOfferDailyAction() {
  const { pair } = await requirePair();
  const periodKey = dailyPeriodKey(new Date(), pair.timezone);
  const existing = await prisma.pairChallenge.findMany({
    where: { pairId: pair.id, periodKey, template: { period: "DAILY" } },
    include: { template: true },
  });
  if (existing.length >= 3) return existing;

  const already = existing.map((e) => e.templateId);
  const pool = await prisma.challengeTemplate.findMany({
    where: { period: "DAILY", active: true, isSpicy: pair.spicyEnabled ? undefined : false, id: { notIn: already } },
    take: 6,
  });
  const offered = [...existing];
  for (const tpl of pool.slice(0, 3 - existing.length)) {
    const pc = await prisma.pairChallenge.upsert({
      where: { pairId_templateId_periodKey: { pairId: pair.id, templateId: tpl.id, periodKey } },
      update: {},
      create: {
        pairId: pair.id,
        templateId: tpl.id,
        periodKey,
        status: "OFFERED",
      },
      include: { template: true },
    });
    offered.push(pc);
  }
  return offered;
}

export async function refreshWeekly() {
  const { pair } = await requirePair();
  const periodKey = weeklyPeriodKey(new Date(), pair.timezone);
  const existing = await prisma.pairChallenge.findMany({
    where: { pairId: pair.id, periodKey, template: { period: "WEEKLY" } },
    include: { template: true },
  });
  return existing;
}
