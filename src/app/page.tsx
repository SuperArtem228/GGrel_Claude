import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function Index() {
  const session = await getSession();
  if (!session) redirect("/welcome");
  const member = await prisma.pairMember.findFirst({
    where: { userId: session.userId },
    include: { pair: true },
  });
  if (!member) redirect("/pair/create");
  if (member.pair.status !== "ACTIVE") redirect("/pair/waiting");
  redirect("/home");
}
