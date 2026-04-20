"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-tight transition will-change-transform active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap select-none";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-12 px-5 text-[14px]",
  lg: "h-14 px-6 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-hair hover:brightness-110",
  accent: "bg-accent text-[color:var(--accent-ink)] shadow-card hover:brightness-[1.03]",
  ghost: "bg-transparent text-ink border border-[color:var(--hairline-strong)]",
  soft: "bg-surface-alt text-ink border border-[color:var(--hairline)]",
  danger: "bg-danger text-white hover:brightness-110",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = "primary", size = "md", full, loading, className, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], full && "w-full", className)}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
});
