"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib";

type HoldToConfirmProps = {
  onConfirm: () => void;
  children: ReactNode;
  holdLabel?: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
};

/**
 * Destructive action guard (Emil Kowalski's hold-to-delete): the fill is a
 * progress indicator, so it runs linear and slow while the user decides,
 * and snaps back fast (200ms ease-out) on release. Works with pointer and
 * keyboard (hold Space/Enter).
 */
export function HoldToConfirm({
  onConfirm,
  children,
  holdLabel = "Удерживайте…",
  duration = 2000,
  disabled,
  className,
}: HoldToConfirmProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const start = () => {
    if (disabled || holding) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, duration);
  };
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={typeof children === "string" ? `${children} (удерживайте)` : undefined}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && !event.repeat) {
          event.preventDefault();
          start();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") cancel();
      }}
      className={cn(
        "relative isolate inline-flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-danger-soft px-5 font-medium text-danger select-none",
        "transition-transform duration-(--duration-press) ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-danger"
        style={{
          clipPath: holding ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: holding
            ? `clip-path ${duration}ms linear`
            : "clip-path 200ms var(--ease-out)",
        }}
      />
      <span className={cn("transition-colors duration-200 ease-out", holding && "text-white")}>
        {holding ? holdLabel : children}
      </span>
    </button>
  );
}
