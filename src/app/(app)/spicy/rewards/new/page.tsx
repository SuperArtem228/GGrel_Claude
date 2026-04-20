import { redirect } from "next/navigation";
import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { requirePair } from "@/lib/session";
import { NewSpicyRewardForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewSpicyRewardPage() {
  const { pair } = await requirePair();
  if (!pair.spicyEnabled) redirect("/spicy");
  return (
    <div data-mode="spicy">
      <TopHeader title="Новая приватная награда" backHref="/spicy/rewards" />
      <MobileScroll>
        <NewSpicyRewardForm />
      </MobileScroll>
    </div>
  );
}
