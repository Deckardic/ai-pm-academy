"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn, copyToClipboard } from "@/shared/lib";
import { Button, type ButtonVariantProps } from "./button";

type CopyButtonProps = {
  text: string | (() => string);
  label?: string;
  copiedLabel?: string;
  className?: string;
  onCopied?: () => void;
} & ButtonVariantProps;

/**
 * State indication: the label morphs into «Скопировано» (blur-bridged
 * crossfade), then quietly returns. Interruptible — CSS transitions only.
 */
export function CopyButton({
  text,
  label = "Скопировать",
  copiedLabel = "Скопировано",
  className,
  onCopied,
  variant = "secondary",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const layer =
    "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 transition-[opacity,filter,transform] duration-200 ease-out motion-reduce:transition-opacity";

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("grid", className)}
      onClick={async () => {
        const ok = await copyToClipboard(typeof text === "function" ? text() : text);
        if (!ok) return;
        setCopied(true);
        onCopied?.();
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      }}
    >
      <span aria-hidden={copied} className={cn(layer, copied && "scale-95 opacity-0 blur-[2px]")}>
        <Copy /> {label}
      </span>
      <span
        aria-hidden={!copied}
        className={cn(layer, "text-success", !copied && "scale-95 opacity-0 blur-[2px]")}
      >
        <Check /> {copiedLabel}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  );
}
