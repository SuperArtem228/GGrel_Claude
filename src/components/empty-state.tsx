import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  icon = "🌿",
  action,
  className,
}: {
  title: string;
  body?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[color:var(--hairline-strong)] bg-surface-alt p-8 text-center",
        className,
      )}
    >
      <div className="text-4xl opacity-70">{icon}</div>
      <div>
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        {body ? <p className="mt-1 max-w-[28ch] text-[13px] text-muted">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}
