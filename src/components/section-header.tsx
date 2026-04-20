import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  sub,
  action,
  href,
  className,
}: {
  title: string;
  sub?: string;
  action?: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between", className)}>
      <div>
        <h2 className="h-display text-[18px] tracking-tight">{title}</h2>
        {sub ? <p className="mt-0.5 text-[12px] text-muted">{sub}</p> : null}
      </div>
      {action && href ? (
        <Link href={href} className="text-[12px] font-medium text-ink underline-offset-4 hover:underline">
          {action} →
        </Link>
      ) : null}
    </div>
  );
}
