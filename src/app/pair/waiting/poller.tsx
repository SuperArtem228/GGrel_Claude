"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkPairStatusAction } from "@/actions/pair";

export function WaitingPoller() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(async () => {
      const st = await checkPairStatusAction();
      if (st === "ACTIVE") {
        router.replace("/home");
      }
    }, 10_000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
