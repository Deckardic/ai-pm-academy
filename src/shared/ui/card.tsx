import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

export function Card({
  className,
  interactive = false,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "surface-card",
        // Hovered tens of times a day: only the shadow responds, nothing moves.
        interactive && "transition-shadow duration-200 ease-out hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  );
}
