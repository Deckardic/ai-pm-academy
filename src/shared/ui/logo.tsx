import { cn } from "@/shared/lib";

/** Mark: three ascending steps — Junior, Middle, Senior. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-fg" />
      <rect x="7" y="18" width="5" height="7" rx="1.5" className="fill-junior" />
      <rect x="13.5" y="13" width="5" height="12" rx="1.5" className="fill-middle" />
      <rect x="20" y="7" width="5" height="18" rx="1.5" className="fill-senior" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[0.9375rem] font-semibold tracking-[-0.02em]">
        AI PM <span className="hidden text-fg-muted sm:inline">Academy</span>
      </span>
    </span>
  );
}
