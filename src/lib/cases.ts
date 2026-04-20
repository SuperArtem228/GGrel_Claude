import "server-only";
import { prisma } from "./prisma";
import { secureRandom } from "./utils";
import { debitCommon, reservePersonal } from "./wallet";

export async function openCaseAtomic(opts: {
  pairId: string;
  userId: string;
  caseTemplateId: string;
  fundingSource?: "PERSONAL" | "COMMON";
}) {
  const { pairId, userId, caseTemplateId, fundingSource = "PERSONAL" } = opts;

  return prisma.$transaction(async (tx) => {
    const caseTpl = await tx.caseTemplate.findUnique({
      where: { id: caseTemplateId },
      include: { items: { include: { rewardTemplate: true } } },
    });
    if (!caseTpl) throw new Error("Кейс не найден");
    if (!caseTpl.active) throw new Error("Кейс недоступен");
    if (caseTpl.items.length < 3) throw new Error("В кейсе меньше 3 наград");

    if (caseTpl.isSpicy) {
      const pair = await tx.pair.findUnique({ where: { id: pairId } });
      if (!pair?.spicyEnabled) throw new Error("Приватный режим не включён");
    }

    const sum = caseTpl.items.reduce((s, i) => s + i.probabilityPercent, 0);
    if (sum !== 100) throw new Error("Сумма вероятностей в кейсе должна быть 100");

    // Debit
    if (fundingSource === "COMMON") {
      await debitCommon(tx, pairId, caseTpl.openPriceLc, "CASE_OPEN", "case", caseTpl.id);
    } else {
      await reservePersonal(tx, pairId, userId, caseTpl.openPriceLc, "CASE_OPEN", "case", caseTpl.id);
    }

    // Weighted draw
    const r = secureRandom() * 100;
    let acc = 0;
    let picked = caseTpl.items[caseTpl.items.length - 1];
    for (const item of caseTpl.items) {
      acc += item.probabilityPercent;
      if (r < acc) {
        picked = item;
        break;
      }
    }

    const open = await tx.caseOpen.create({
      data: {
        caseTemplateId: caseTpl.id,
        pairId,
        openedByUserId: userId,
        receivedRewardTemplateId: picked.rewardTemplateId,
        openPriceLc: caseTpl.openPriceLc,
        resultProbabilityPercent: picked.probabilityPercent,
      },
    });

    const owned = await tx.ownedReward.create({
      data: {
        pairId,
        rewardTemplateId: picked.rewardTemplateId,
        ownerUserId: userId,
        purchasedByUserId: userId,
        status: "OWNED",
        sourceType: "CASE",
        sourceId: open.id,
        privateFlag: caseTpl.isSpicy,
      },
    });

    return {
      open,
      rewardTemplate: picked.rewardTemplate,
      probability: picked.probabilityPercent,
      ownedReward: owned,
    };
  });
}
