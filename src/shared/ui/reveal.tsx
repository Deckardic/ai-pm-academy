"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/shared/lib";

type RevealProps = ComponentProps<"div"> & {
  delay?: number;
};

/**
 * Scroll reveal for marketing surfaces only. Fires once — re-animating on
 * every scroll-by is an interface fighting its reader.
 */
export function Reveal({ className, delay = 0, style, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.setAttribute("data-visible", "");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...props}
    />
  );
}
