import { Check } from "lucide-react";
import { cn } from "@/shared/lib";

export type LessonStatus = "done" | "updated" | "todo";

/** Small status dot for lesson lists. */
export function LessonStatusIcon({
  status,
  className,
}: {
  status: LessonStatus;
  className?: string;
}) {
  if (status === "todo") {
    return (
      <span
        aria-label="Не пройден"
        className={cn(
          "grid size-5 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
          className,
        )}
      />
    );
  }
  return (
    <span
      aria-label={status === "updated" ? "Пройден, урок обновлён" : "Пройден"}
      className={cn(
        "grid size-5 place-items-center rounded-full text-white",
        status === "updated" ? "bg-warning" : "bg-success",
        className,
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}
