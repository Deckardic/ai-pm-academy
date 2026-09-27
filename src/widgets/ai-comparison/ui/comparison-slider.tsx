"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib";

type ComparisonSliderProps = {
  before: ReactNode;
  after: ReactNode;
  labelBefore: string;
  labelAfter: string;
  initial?: number;
  className?: string;
};

/**
 * Explanation, not decoration: drag to compare the same task done by hand
 * and with AI. One element is clipped (clip-path), nothing is re-laid-out,
 * and pointer moves write to style directly — no React render per frame.
 */
export function ComparisonSlider({
  before,
  after,
  labelBefore,
  labelAfter,
  initial = 50,
  className,
}: ComparisonSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [value, setValue] = useState(initial);

  const apply = useCallback((percent: number) => {
    const clamped = Math.min(100, Math.max(0, percent));
    if (afterRef.current) afterRef.current.style.clipPath = `inset(0 0 0 ${clamped}%)`;
    if (handleRef.current)
      handleRef.current.style.transform = `translateX(-50%) translateX(${clamped}cqw)`;
    return clamped;
  }, []);

  useEffect(() => {
    apply(value);
  }, [apply, value]);

  const fromPointer = (clientX: number) => {
    const rect = rootRef.current!.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "[container-type:inline-size] relative isolate overflow-hidden rounded-2xl shadow-card",
        className,
      )}
      style={{ touchAction: "pan-y" }}
      onPointerDown={(event) => {
        if (dragging.current) return; // multi-touch protection
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        apply(fromPointer(event.clientX));
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        apply(fromPointer(event.clientX));
      }}
      onPointerUp={(event) => {
        if (!dragging.current) return;
        dragging.current = false;
        setValue(Math.round(apply(fromPointer(event.clientX))));
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <div className="bg-surface">{before}</div>
      <div
        ref={afterRef}
        className="absolute inset-0 bg-surface-raised"
        style={{ clipPath: `inset(0 0 0 ${initial}%)` }}
      >
        {after}
      </div>

      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-bg/80 px-2.5 py-1 text-xs font-medium text-fg-muted shadow-sm backdrop-blur">
        {labelBefore}
      </span>
      <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg shadow-sm">
        {labelAfter}
      </span>

      <div
        ref={handleRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 flex w-10 cursor-ew-resize justify-center"
        style={{ transform: `translateX(-50%) translateX(${initial}cqw)` }}
      >
        <span className="h-full w-0.5 bg-accent" />
        <span className="absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-surface-raised text-accent shadow-popover">
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 4 2 8l4 4M10 4l4 4-4 4" />
          </svg>
        </span>
      </div>

      {/* Keyboard and screen readers get a native range control. */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={`Сравнение: ${labelBefore} и ${labelAfter}`}
        onChange={(event) => setValue(Number(event.target.value))}
        className="peer sr-only"
      />
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-accent peer-focus-visible:opacity-100" />
    </div>
  );
}
