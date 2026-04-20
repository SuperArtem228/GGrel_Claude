import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-mobile flex-col overflow-hidden bg-bg">
      <div className={cn("relative flex flex-1 flex-col overflow-hidden", className)}>{children}</div>
    </div>
  );
}

export function MobileScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn("no-scrollbar relative flex-1 overflow-y-auto px-5 pb-6", className)}>
      {children}
    </main>
  );
}
