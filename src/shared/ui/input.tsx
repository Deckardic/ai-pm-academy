import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

const fieldClass =
  "w-full rounded-lg bg-surface px-3.5 text-base text-fg shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow duration-150 ease-[ease] outline-none placeholder:text-fg-subtle focus:shadow-[inset_0_0_0_1.5px_var(--accent),0_0_0_4px_var(--accent-soft)] aria-invalid:shadow-[inset_0_0_0_1.5px_var(--danger)] disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClass, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={cn(fieldClass, "min-h-28 py-3 leading-relaxed", className)} {...props} />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-fg", className)} {...props} />;
}
