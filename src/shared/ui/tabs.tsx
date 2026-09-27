"use client";

import type { ComponentProps } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "@/shared/lib";

export const Tabs = BaseTabs.Root;

export function TabsList({ className, children, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        "relative z-0 inline-flex items-center gap-1 rounded-xl bg-surface-sunken p-1 shadow-[inset_0_0_0_1px_var(--line)]",
        className,
      )}
      {...props}
    >
      {children}
      {/* The pill moves on screen, so it uses ease-in-out. */}
      <BaseTabs.Indicator className="absolute top-1 left-0 -z-10 h-[calc(100%-0.5rem)] w-(--active-tab-width) translate-x-(--active-tab-left) rounded-lg bg-surface shadow-sm transition-[translate,width] duration-250 ease-in-out motion-reduce:transition-none" />
    </BaseTabs.List>
  );
}

export function Tab({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "flex h-8 pressable cursor-pointer items-center justify-center rounded-lg px-3.5 text-sm font-medium whitespace-nowrap text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent data-active:text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn("outline-none", className)} {...props} />;
}
