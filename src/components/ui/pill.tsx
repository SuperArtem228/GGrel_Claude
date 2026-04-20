import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "accent"
  | "accent-soft"
  | "ink"
  | "ghost"
  | "muted"
  | "plum"
  | "plum-soft"
  | "magenta"
  | "magenta-soft"
  | "success"
  | "warning"
  | "danger";
type Size = "sm" | "md" | "lg";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

const sizes: Record<Size, string> = {
  sm: "h-[22px] px-2 text-[11px]",
  md: "h-7 px-3 text-[12px]",
  lg: "h-[34px] px-3.5 text-[13px]",
};

const variants: Record<Variant, string> = {
  default: "bg-surface border border-[color:var(--hairline-strong)] text-ink",
  accent: "bg-accent text-[color:var(--accent-ink)]",
  "accent-soft": "bg-accent-soft text-[color:var(--accent-ink)]",
  ink: "bg-ink text-white",
  ghost: "bg-transparent border border-[color:var(--hairline-strong)] text-muted",
  muted: "bg-surface-alt text-muted",
  plum: "bg-plum text-white",
  "plum-soft": "bg-plum-soft text-plum-ink",
  magenta: "bg-magenta text-white",
  "magenta-soft": "bg-magenta-soft text-plum-ink",
  success: "bg-[rgba(31,138,76,0.1)] text-success",
  warning: "bg-[rgba(184,118,14,0.1)] text-warning",
  danger: "bg-[rgba(197,48,48,0.08)] text-danger",
};

export function Pill({ children, variant = "default", size = "md", icon, className, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill font-medium whitespace-nowrap",
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
