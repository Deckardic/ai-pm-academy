import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-md bg-surface-sunken", className)}
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-fg/5 to-transparent motion-reduce:hidden" />
    </div>
  );
}
