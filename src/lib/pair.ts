import "server-only";
import { prisma } from "./prisma";

export async function requireSpicyEnabled(pairId: string) {
  const pair = await prisma.pair.findUnique({ where: { id: pairId } });
  if (!pair?.spicyEnabled) {
    throw new Error("Приватный режим не включён обоими партнёрами");
  }
  return pair;
}

export async function recomputeSpicyEnabled(pairId: string) {
  const members = await prisma.pairMember.findMany({ where: { pairId } });
  const both = members.length === 2 && members.every((m) => m.spicyOptIn);
  await prisma.pair.update({ where: { id: pairId }, data: { spicyEnabled: both } });
  return both;
}

export async function requireMembership(pairId: string, userId: string) {
  const m = await prisma.pairMember.findUnique({ where: { pairId_userId: { pairId, userId } } });
  if (!m) throw new Error("Недоступно: не участник пары");
  return m;
}
