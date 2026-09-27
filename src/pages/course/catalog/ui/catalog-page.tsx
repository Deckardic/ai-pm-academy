import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getCourseStats, getLevels, getModules } from "@/entities/course/index.server";
import { levelTheme } from "@/entities/course";
import { routes } from "@/shared/config";
import { cn, formatCount } from "@/shared/lib";
import { Badge, ButtonLink, Container, PageHeader, Reveal } from "@/shared/ui";

export const catalogMetadata: Metadata = {
  title: "Программа курса",
  description:
    "Полная программа бесплатного курса для проект-менеджеров: три уровня — Junior, Middle и Senior — и модули от основ до AI-трансформации.",
  alternates: { canonical: routes.catalog() },
};

export function CatalogPage() {
  const levels = getLevels();
  return (
    <Container className="py-14 lg:py-20">
      <PageHeader
        eyebrow={<Badge tone="accent">Программа</Badge>}
        title="Три уровня, одна траектория"
        description="Идите по порядку или начните с того уровня, который подходит вам сейчас. Все уроки открыты — аккаунт нужен только для прогресса, тестов и сертификата."
        actions={
          <ButtonLink href={routes.placementTest()} variant="secondary">
            Не знаете, с чего начать? Пройдите тест <ArrowRight aria-hidden />
          </ButtonLink>
        }
      />
      <div className="mt-14 flex flex-col gap-14">
        {levels.map((level) => {
          const modules = getModules(level.slug);
          const stats = getCourseStats(level.slug);
          const theme = levelTheme[level.id];
          return (
            <Reveal key={level.id}>
              <section
                aria-labelledby={`level-${level.id}`}
                className="grid gap-6 lg:grid-cols-[18rem_1fr]"
              >
                <div className="flex flex-col gap-3">
                  <span className={cn("text-sm font-semibold tracking-wide uppercase", theme.text)}>
                    {level.title}
                  </span>
                  <h2
                    id={`level-${level.id}`}
                    className="text-2xl leading-tight font-semibold tracking-tight"
                  >
                    <Link
                      href={routes.level(level.slug)}
                      className="transition-colors duration-150 ease-[ease] hover:text-accent"
                    >
                      {level.tagline}
                    </Link>
                  </h2>
                  <p className="text-sm text-fg-muted">
                    {level.status === "soon"
                      ? "Скоро"
                      : `${formatCount(stats.modulesTotal, ["модуль", "модуля", "модулей"])} · ${formatCount(stats.lessons, ["урок", "урока", "уроков"])} опубликовано`}
                  </p>
                </div>
                {modules.length > 0 ? (
                  <ol className="grid gap-2 sm:grid-cols-2">
                    {modules.map((module) => {
                      const published = module.status === "published";
                      return (
                        <li key={module.id}>
                          <Link
                            href={routes.module(level.slug, module.slug)}
                            className={cn(
                              "flex h-full items-center gap-3 rounded-lg px-4 py-3 text-[0.9375rem] transition-[background-color,box-shadow] duration-150 ease-[ease]",
                              published
                                ? "surface-card hover:shadow-card-hover"
                                : "text-fg-muted shadow-[inset_0_0_0_1px_var(--line)] hover:bg-bg-subtle",
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "size-2 shrink-0 rounded-full",
                                published ? theme.bg : "bg-line-strong",
                              )}
                            />
                            <span className="flex-1">{module.title}</span>
                            {!published ? (
                              <span className="text-xs text-fg-subtle">скоро</span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <ul className="grid gap-2 text-[0.9375rem] text-fg-muted sm:grid-cols-2">
                    {level.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="rounded-lg px-4 py-3 shadow-[inset_0_0_0_1px_var(--line)]"
                      >
                        {outcome}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
}
