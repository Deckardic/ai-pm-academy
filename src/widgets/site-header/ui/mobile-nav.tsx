"use client";

import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { Menu as MenuIcon, X } from "lucide-react";
import { routes } from "@/shared/config";
import type { NavItem } from "./nav-links";

/** Bottom sheet on phones: slides with the iOS-like drawer curve. */
export function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label="Открыть меню"
        className="grid size-9 pressable cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle hover:text-fg md:hidden"
      >
        <MenuIcon className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/60" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-surface-raised px-4 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-popover transition-transform duration-500 ease-drawer data-ending-style:translate-y-full data-starting-style:translate-y-full motion-reduce:transition-opacity motion-reduce:data-ending-style:translate-y-0 motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:translate-y-0 motion-reduce:data-starting-style:opacity-0">
          <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong" />
          <div className="mb-2 flex items-center justify-between">
            <Dialog.Title className="text-sm font-medium text-fg-muted">Меню</Dialog.Title>
            <Dialog.Close
              aria-label="Закрыть меню"
              className="grid size-9 pressable cursor-pointer place-items-center rounded-lg text-fg-muted hover:bg-bg-subtle"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <nav aria-label="Мобильная навигация">
            <ul className="flex flex-col">
              {[{ href: routes.home(), label: "Главная", match: "/" }, ...items].map((item) => (
                <li key={item.href}>
                  <Dialog.Close
                    render={<Link href={item.href} />}
                    className="flex h-12 pressable items-center rounded-lg px-3 text-lg font-medium active:bg-bg-subtle"
                  >
                    {item.label}
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
