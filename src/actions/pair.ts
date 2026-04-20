"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const inviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = customAlphabet(inviteAlphabet, 8);

export type PairState = { error?: string; inviteCode?: string } | null;

export async function createPairAction(_: PairState, formData: FormData): Promise<PairState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim() || `${user.displayName} & ?`;

  const existing = await prisma.pairMember.findFirst({ where: { userId: user.id } });
  if (existing) {
    if (existing.pairId) {
      const pair = await prisma.pair.findUnique({ where: { id: existing.pairId } });
      if (pair?.status === "ACTIVE") redirect("/home");
      if (pair?.status === "PENDING") redirect("/pair/waiting");
    }
  }

  const code = genCode();
  const pair = await prisma.$transaction(async (tx) => {
    const p = await tx.pair.create({
      data: {
        name,
        createdById: user.id,
        status: "PENDING",
        commonWalletBalance: 100,
      },
    });
    await tx.pairMember.create({
      data: { pairId: p.id, userId: user.id, role: "A", personalWalletBalance: 200 },
    });
    await tx.walletTransaction.createMany({
      data: [
        { pairId: p.id, userId: user.id, walletType: "PERSONAL", amountLc: 200, reason: "SEED" },
        { pairId: p.id, walletType: "COMMON", amountLc: 100, reason: "SEED" },
      ],
    });
    await tx.pairInvite.create({
      data: {
        pairId: p.id,
        code,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return p;
  });

  redirect(`/pair/waiting?code=${code}&pair=${pair.id}`);
}

export async function joinPairAction(_: PairState, formData: FormData): Promise<PairState> {
  const user = await requireUser();
  const rawCode = String(formData.get("code") ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  if (rawCode.length !== 8) return { error: "Код должен быть 8 символов" };

  const existing = await prisma.pairMember.findFirst({ where: { userId: user.id } });
  if (existing) return { error: "Вы уже состоите в паре" };

  try {
    await prisma.$transaction(async (tx) => {
      const invite = await tx.pairInvite.findUnique({ where: { code: rawCode } });
      if (!invite) throw new Error("Код не найден");
      if (invite.consumedAt) throw new Error("Код уже использован");
      if (invite.expiresAt < new Date()) throw new Error("Код истёк");

      const pair = await tx.pair.findUnique({ where: { id: invite.pairId } });
      if (!pair) throw new Error("Пара не найдена");

      const members = await tx.pairMember.count({ where: { pairId: pair.id } });
      if (members >= 2) throw new Error("Пара уже заполнена");
      if (pair.createdById === user.id) throw new Error("Нельзя использовать собственный код");

      await tx.pairMember.create({
        data: { pairId: pair.id, userId: user.id, role: "B", personalWalletBalance: 200 },
      });
      await tx.walletTransaction.create({
        data: { pairId: pair.id, userId: user.id, walletType: "PERSONAL", amountLc: 200, reason: "SEED" },
      });
      await tx.pair.update({ where: { id: pair.id }, data: { status: "ACTIVE" } });
      await tx.pairInvite.update({ where: { code: rawCode }, data: { consumedAt: new Date() } });
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  redirect("/home");
}

export async function checkPairStatusAction() {
  const user = await requireUser();
  const member = await prisma.pairMember.findFirst({
    where: { userId: user.id },
    include: { pair: true },
  });
  return member?.pair?.status ?? "NONE";
}

export async function regenerateInviteAction() {
  const user = await requireUser();
  const member = await prisma.pairMember.findFirst({ where: { userId: user.id } });
  if (!member) return { error: "Нет пары" };
  const code = genCode();
  await prisma.pairInvite.create({
    data: {
      pairId: member.pairId,
      code,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  revalidatePath("/pair/waiting");
  return { code };
}
