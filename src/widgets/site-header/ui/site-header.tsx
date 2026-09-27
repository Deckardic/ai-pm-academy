import Link from "next/link";
import { Suspense } from "react";
import { routes } from "@/shared/config";
import { Container, Logo } from "@/shared/ui";
import { ThemeToggle } from "@/features/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { NavLinks, NavLinksStatic, type NavItem } from "./nav-links";
import { UserArea, UserAreaFallback } from "./user-area";

const navItems: NavItem[] = [
  { href: routes.catalog(), label: "Курс", match: "/kurs" },
  { href: routes.prompts(), label: "Промпты", match: "/biblioteka/prompty" },
  { href: routes.templates(), label: "Шаблоны", match: "/biblioteka/shablony" },
  { href: routes.glossary(), label: "Глоссарий", match: "/glossariy" },
  { href: routes.placementTest(), label: "Тест на уровень", match: "/test-urovnya" },
];

export function SiteHeader() {
  return (
    <header className="site-header material sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
      <Container size="wide" className="flex h-16 items-center gap-3 md:gap-6">
        <Link
          href={routes.home()}
          aria-label="AI PM Academy — на главную"
          className="shrink-0 rounded-md"
        >
          <Logo />
        </Link>
        {/* The active state depends on the URL, so it streams in; the links themselves are in the shell. */}
        <Suspense fallback={<NavLinksStatic items={navItems} className="hidden md:block" />}>
          <NavLinks items={navItems} className="hidden md:block" />
        </Suspense>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Suspense fallback={<UserAreaFallback />}>
            <UserArea />
          </Suspense>
          <MobileNav items={navItems} />
        </div>
      </Container>
    </header>
  );
}
