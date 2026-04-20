import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopHeader({
  title,
  sub,
  left,
  right,
  backHref,
  className,
}: {
  title?: React.ReactNode;
  sub?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  backHref?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex min-h-[52px] items-center justify-between px-5 py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface"
          >
            <ChevronLeft size={20} />
          </Link>
        ) : (
          left
        )}
        <div className="min-w-0">
          {title ? (
            <div className="truncate text-[15px] font-semibold leading-tight tracking-tight">{title}</div>
          ) : null}
          {sub ? <div className="mt-0.5 truncate text-[11px] text-muted">{sub}</div> : null}
        </div>
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </header>
  );
}
