import { cn } from "@/shared/lib";

/** Inline, announced error. Appears with a short fade — never a layout jump. */
export function FieldError({
  message,
  className,
}: {
  message: string | null | undefined;
  className?: string;
}) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn(
        "text-sm text-danger transition-opacity duration-150 ease-out starting:opacity-0",
        !message && "sr-only",
        className,
      )}
    >
      {message}
    </p>
  );
}
