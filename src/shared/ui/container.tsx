import type { ComponentProps } from "react";
import { cn } from "@/shared/lib";

export function Container({
  className,
  size = "default",
  ...props
}: ComponentProps<"div"> & { size?: "narrow" | "default" | "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-7xl",
        className,
      )}
      {...props}
    />
  );
}
