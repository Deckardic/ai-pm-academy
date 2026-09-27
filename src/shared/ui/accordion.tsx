"use client";

import type { ComponentProps, ReactNode } from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib";

export function Accordion({ className, ...props }: ComponentProps<typeof BaseAccordion.Root>) {
  return <BaseAccordion.Root className={cn("flex flex-col", className)} {...props} />;
}

type AccordionItemProps = {
  title: ReactNode;
  children: ReactNode;
  value?: string;
  className?: string;
};

export function AccordionItem({ title, children, value, className }: AccordionItemProps) {
  return (
    <BaseAccordion.Item value={value} className={cn("border-b border-line", className)}>
      <BaseAccordion.Header className="m-0">
        <BaseAccordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-medium text-fg transition-colors duration-150 ease-[ease] hover:text-accent">
          {title}
          <Plus
            aria-hidden
            className="size-5 shrink-0 text-fg-subtle transition-transform duration-200 ease-out group-data-panel-open:rotate-45"
          />
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      {/* One of the few places height animates: there is no transform equivalent. Kept short. */}
      <BaseAccordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height,opacity] duration-200 ease-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0">
        <div className="pb-5 leading-relaxed text-fg-muted">{children}</div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}
