"use client";

import type { ComponentProps } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { cn } from "@/shared/lib";

/** The check mark draws itself (stroke-dashoffset) — state indication, not decoration. */
export function Checkbox({ className, ...props }: ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      className={cn(
        "peer grid size-5 shrink-0 pressable cursor-pointer place-items-center rounded-[0.375rem] bg-surface shadow-[inset_0_0_0_1.5px_var(--line-strong)] data-checked:bg-accent data-checked:shadow-none",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator keepMounted className="text-accent-fg data-unchecked:hidden">
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="animate-[draw_220ms_var(--ease-out)_forwards] [stroke-dasharray:1] [stroke-dashoffset:1] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
          />
        </svg>
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
