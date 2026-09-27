import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";
import { absoluteUrl } from "@/shared/config";
import { JsonLd, cn } from "@/shared/lib";

export type Crumb = { label: string; href: Route };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <nav aria-label="Хлебные крошки" className={cn("text-sm text-fg-muted", className)}>
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="text-fg">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="rounded transition-colors duration-150 ease-[ease] hover:text-fg"
                  >
                    {item.label}
                  </Link>
                )}
                {!last ? <ChevronRight aria-hidden className="size-3.5 text-fg-subtle" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  );
}
