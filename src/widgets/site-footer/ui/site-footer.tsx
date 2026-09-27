import Link from "next/link";
import type { Route } from "next";
import { routes, siteConfig } from "@/shared/config";
import { Container, Logo } from "@/shared/ui";

type Column = { title: string; links: { label: string; href: Route; external?: boolean }[] };

export function SiteFooter() {
  const columns: Column[] = [
    {
      title: "Курс",
      links: [
        { label: "Программа", href: routes.catalog() },
        { label: "Junior", href: routes.level("junior") },
        { label: "Middle", href: routes.level("middle") },
        { label: "Senior — скоро", href: routes.level("senior") },
        { label: "Тест на уровень", href: routes.placementTest() },
      ],
    },
    {
      title: "Библиотека",
      links: [
        { label: "Промпты", href: routes.prompts() },
        { label: "Шаблоны", href: routes.templates() },
        { label: "Глоссарий", href: routes.glossary() },
      ],
    },
    {
      title: "Проект",
      links: [
        { label: "О проекте", href: routes.about() },
        ...(siteConfig.telegram
          ? [{ label: "Telegram-канал", href: siteConfig.telegram as Route, external: true }]
          : []),
      ],
    },
    {
      title: "Документы",
      links: [
        { label: "Политика обработки ПДн", href: routes.privacy() },
        { label: "Согласие на обработку ПДн", href: routes.consent() },
        { label: "Пользовательское соглашение", href: routes.terms() },
        { label: "Cookies", href: routes.cookies() },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-bg-subtle pb-[env(safe-area-inset-bottom)]">
      <Container size="wide" className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-fg-muted">
            Бесплатный просветительский проект: управление проектами и работа с ИИ — от нуля до
            Middle.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-medium">{column.title}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-sm text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container
        size="wide"
        className="flex flex-col gap-2 border-t border-line py-6 text-xs text-fg-subtle sm:flex-row sm:justify-between"
      >
        <p>© 2026 {siteConfig.name}</p>
        <p>Сертификаты курса не являются документами об образовании.</p>
      </Container>
    </footer>
  );
}
