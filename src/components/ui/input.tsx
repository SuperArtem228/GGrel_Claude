import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id || autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-medium text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          "h-12 rounded-md border border-[color:var(--hairline-strong)] bg-surface px-4 text-[15px]",
          "outline-none placeholder:text-muted2 focus:border-ink/40 focus:ring-4 focus:ring-[color:var(--accent-wash)]",
          error && "border-danger focus:border-danger focus:ring-[rgba(197,48,48,0.1)]",
          className,
        )}
        {...rest}
      />
      {error ? (
        <span className="text-[12px] text-danger">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-muted">{hint}</span>
      ) : null}
    </div>
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  function Textarea({ label, className, id, ...rest }, ref) {
    const autoId = React.useId();
    const inputId = id || autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[12px] font-medium text-muted">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "min-h-[96px] rounded-md border border-[color:var(--hairline-strong)] bg-surface px-4 py-3 text-[15px] resize-none",
            "outline-none placeholder:text-muted2 focus:border-ink/40 focus:ring-4 focus:ring-[color:var(--accent-wash)]",
            className,
          )}
          {...rest}
        />
      </div>
    );
  },
);
