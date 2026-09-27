"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { cn } from "@/shared/lib";

export type NavItem = { href: Route; label: string; match: string };

/** Navigation is used constantly, so the active state changes instantly — no animation. */
export function NavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname() ?? "";
  return <NavList items={items} pathname={pathname} className={className} />;
}

export function NavLinksStatic({ items, className }: { items: NavItem[]; className?: string }) {
  return <NavList items={items} pathname="" className={className} />;
}

function NavList({
  items,
  pathname,
  className,
}: {
  items: NavItem[];
  pathname: string;
  className?: string;
}) {
  return (
    <nav aria-label="Основная навигация" className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = pathname === item.match || pathname.startsWith(`${item.match}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg",
                  active && "text-fg",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
