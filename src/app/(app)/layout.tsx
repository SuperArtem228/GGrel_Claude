import { requirePair } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requirePair();
  return (
    <AppShell>
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">{children}</div>
      <BottomNav />
    </AppShell>
  );
}
