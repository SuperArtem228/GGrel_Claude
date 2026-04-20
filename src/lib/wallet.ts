import "server-only";
import type { Prisma, PrismaClient, TxReason, WalletType } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function reservePersonal(
  tx: Tx,
  pairId: string,
  userId: string,
  amount: number,
  reason: TxReason,
  relatedType?: string,
  relatedId?: string,
) {
  if (amount <= 0) throw new Error("Сумма должна быть больше 0");
  const member = await tx.pairMember.findUnique({ where: { pairId_userId: { pairId, userId } } });
  if (!member) throw new Error("Не участник пары");
  if (member.personalWalletBalance < amount) throw new Error("Недостаточно средств");
  await tx.pairMember.update({
    where: { pairId_userId: { pairId, userId } },
    data: { personalWalletBalance: { decrement: amount } },
  });
  await tx.walletTransaction.create({
    data: { pairId, userId, walletType: "PERSONAL", amountLc: -amount, reason, relatedType, relatedId },
  });
}

export async function creditPersonal(
  tx: Tx,
  pairId: string,
  userId: string,
  amount: number,
  reason: TxReason,
  relatedType?: string,
  relatedId?: string,
) {
  if (amount <= 0) return;
  await tx.pairMember.update({
    where: { pairId_userId: { pairId, userId } },
    data: { personalWalletBalance: { increment: amount } },
  });
  await tx.walletTransaction.create({
    data: { pairId, userId, walletType: "PERSONAL", amountLc: amount, reason, relatedType, relatedId },
  });
}

export async function creditCommon(
  tx: Tx,
  pairId: string,
  amount: number,
  reason: TxReason,
  relatedType?: string,
  relatedId?: string,
) {
  if (amount <= 0) return;
  await tx.pair.update({ where: { id: pairId }, data: { commonWalletBalance: { increment: amount } } });
  await tx.walletTransaction.create({
    data: { pairId, walletType: "COMMON", amountLc: amount, reason, relatedType, relatedId },
  });
}

export async function debitCommon(
  tx: Tx,
  pairId: string,
  amount: number,
  reason: TxReason,
  relatedType?: string,
  relatedId?: string,
) {
  const pair = await tx.pair.findUnique({ where: { id: pairId } });
  if (!pair) throw new Error("Пара не найдена");
  if (pair.commonWalletBalance < amount) throw new Error("В общем кошельке недостаточно средств");
  await tx.pair.update({ where: { id: pairId }, data: { commonWalletBalance: { decrement: amount } } });
  await tx.walletTransaction.create({
    data: { pairId, walletType: "COMMON", amountLc: -amount, reason, relatedType, relatedId },
  });
}
