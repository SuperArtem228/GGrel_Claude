import "server-only";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import { createSession, destroySession } from "./session";

const emailSchema = z.string().trim().toLowerCase().email("Некорректный email");
const passwordSchema = z.string().min(6, "Пароль минимум 6 символов");
const nameSchema = z.string().trim().min(1, "Нужно имя").max(40);

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: nameSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введи пароль"),
});

export async function signUp(input: z.infer<typeof signUpSchema>, userAgent?: string) {
  const data = signUpSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Такой email уже зарегистрирован");
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash, displayName: data.displayName },
  });
  await createSession(user.id, userAgent);
  return user;
}

export async function signIn(input: z.infer<typeof signInSchema>, userAgent?: string) {
  const data = signInSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("Неверный email или пароль");
  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw new Error("Неверный email или пароль");
  await createSession(user.id, userAgent);
  return user;
}

export async function signOut() {
  await destroySession();
}
