"use client";

import type { ComponentProps, ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/shared/lib";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

type DialogContentProps = ComponentProps<typeof BaseDialog.Popup> & {
  title: ReactNode;
  description?: ReactNode;
};

/** Modals stay centered (not anchored to a trigger) and scale from 0.96, never 0. */
export function DialogContent({
  title,
  description,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity duration-(--duration-modal) ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/60" />
      <BaseDialog.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto overscroll-contain rounded-2xl bg-surface-raised p-6 shadow-popover transition-[scale,opacity] duration-(--duration-modal) ease-out data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-starting-style:scale-[0.96] data-starting-style:opacity-0",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <BaseDialog.Title className="text-lg font-semibold tracking-tight">
              {title}
            </BaseDialog.Title>
            {description ? (
              <BaseDialog.Description className="text-sm leading-relaxed text-fg-muted">
                {description}
              </BaseDialog.Description>
            ) : null}
          </div>
          <BaseDialog.Close
            aria-label="Закрыть"
            className="-mt-1 -mr-2 grid size-8 shrink-0 pressable cursor-pointer place-items-center rounded-md text-fg-subtle hover:bg-bg-subtle hover:text-fg"
          >
            <X className="size-4" />
          </BaseDialog.Close>
        </div>
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
