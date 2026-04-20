"use server";
import { redirect } from "next/navigation";
import { signIn, signOut, signUp } from "@/lib/auth";

export type AuthState = { error?: string } | null;

export async function signUpAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await signUp({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  redirect("/pair/create");
}

export async function signInAction(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await signIn({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  redirect("/home");
}

export async function signOutAction() {
  await signOut();
  redirect("/welcome");
}
