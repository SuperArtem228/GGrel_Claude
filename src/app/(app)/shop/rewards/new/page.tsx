import { TopHeader } from "@/components/top-header";
import { MobileScroll } from "@/components/app-shell";
import { requirePair } from "@/lib/session";
import { NewRewardForm } from "./form";

export const dynamic = "force-dynamic";

export default async function NewRewardPage() {
  const { pair } = await requirePair();
  return (
    <>
      <TopHeader title="Новая награда" backHref="/shop" />
      <MobileScroll>
        <NewRewardForm spicyEnabled={pair.spicyEnabled} />
      </MobileScroll>
    </>
  );
}
