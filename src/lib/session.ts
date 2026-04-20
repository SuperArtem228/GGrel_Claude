import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "bond_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string, userAgent?: string) {
  const id = nanoid(40);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { id, userId, expiresAt, userAgent },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return { id, expiresAt };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sid = cookieStore.get(SESSION_COOKIE)?.value;
  if (sid) {
    await prisma.session.deleteMany({ where: { id: sid } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const sid = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sid) return null;

  const session = await prisma.session.findUnique({
    where: { id: sid },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/welcome");
  return session.user;
}

export async function requirePair() {
  const user = await requireUser();
  const membership = await prisma.pairMember.findFirst({
    where: { userId: user.id },
    include: {
      pair: {
        include: {
          members: { include: { user: true } },
        },
      },
    },
  });
  if (!membership) redirect("/pair/create");
  if (membership.pair.status !== "ACTIVE") {
    if (membership.pair.status === "PENDING") redirect("/pair/waiting");
  }
  const partner = membership.pair.members.find((m) => m.userId !== user.id);
  return { user, me: membership, pair: membership.pair, partner };
}
