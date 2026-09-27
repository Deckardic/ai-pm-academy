import { cn } from "@/shared/lib";

type ProgressBarProps = {
  /** 0..1 */
  value: number;
  tone?: "accent" | "junior" | "middle" | "senior" | "success";
  size?: "sm" | "md";
  className?: string;
  label?: string;
};

const toneClass = {
  accent: "bg-accent",
  junior: "bg-junior",
  middle: "bg-middle",
  senior: "bg-senior",
  success: "bg-success",
} as const;

/**
 * Animates with transform (scaleX), never width. Grows from zero once on mount
 * via @starting-style, then retargets smoothly as the value changes.
 */
export function ProgressBar({
  value,
  tone = "accent",
  size = "md",
  className,
  label,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-surface-sunken shadow-[inset_0_0_0_1px_var(--line)]",
        size === "sm" ? "h-1.5" : "h-2",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 origin-left rounded-full transition-transform duration-700 ease-out motion-reduce:transition-none starting:scale-x-0",
          toneClass[tone],
        )}
        style={{ transform: `scaleX(${clamped})` }}
      />
    </div>
  );
}
