import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Check, Clock, FileText, Layers } from "lucide-react";
import { getCourseStats, getLevel, getLevels, getModules } from "@/entities/course/index.server";
import { LevelBadge, levelTheme, type Level, type Module } from "@/entities/course";
import { absoluteUrl, routes, siteConfig } from "@/shared/config";
import { cn, formatCount, formatDuration, JsonLd } from "@/shared/lib";
import { Badge, Breadcrumbs, ButtonLink, Container, Skeleton } from "@/shared/ui";
import { LevelProgressCard, LevelProgressCardSkeleton } from "@/widgets/level-progress";

type Params = { level: string };

export function generateLevelParams(): Params[] {
  return getLevels().map((level) => ({ level: level.slug }));
}

export async function generateLevelMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const level = getLevel((await params).level);
  if (!level) return {};
  return {
    title: `${level.title}: ${level.tagline}`,
    description: level.description,
    alternates: { canonical: routes.level(level.slug) },
  };
}

export function LevelPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense
      fallback={
        <Container className="py-16">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </Container>
      }
    >
      <LevelContent params={params} />
    </Suspense>
  );
}

function ModuleRow({ module, index }: { module: Module; index: number }) {
  const published = module.status === "published";
  const minutes = module.lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0);
  const body = (
    <>
      <span className="font-mono text-sm text-fg-subtle tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[1.0625rem] font-semibold tracking-tight">{module.title}</span>
          {!published ? <Badge size="sm">Скоро</Badge> : null}
        </span>
        <span className="mt-1 block text-[0.9375rem] leading-relaxed text-fg-muted">
          {module.summary}
        </span>
        <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-subtle">
          {published ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Layers aria-hidden className="size-3.5" />
                {formatCount(module.lessons.length, ["урок", "урока", "уроков"])}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="size-3.5" />
                {formatDuration(minutes)}
              </span>
            </>
          ) : (
            <span>
              {formatCount(module.lessonsPlan.length, ["урок", "урока", "уроков"])} в плане
            </span>
          )}
          {module.artifact ? (
            <span className="inline-flex items-center gap-1.5">
              <FileText aria-hidden className="size-3.5" /> {module.artifact}
            </span>
          ) : null}
        </span>
      </span>
      {published ? (
        <ArrowUpRight
          aria-hidden
          className="size-5 shrink-0 text-fg-subtle transition-colors duration-150 ease-[ease] group-hover:text-fg"
        />
      ) : null}
    </>
  );
  const className = "group surface-card flex items-start gap-5 p-5 sm:p-6";
  return published ? (
    <Link
      href={routes.module(module.levelSlug, module.slug)}
      className={cn(className, "transition-shadow duration-200 ease-out hover:shadow-card-hover")}
    >
      {body}
    </Link>
  ) : (
    <div className={cn(className, "bg-transparent shadow-[inset_0_0_0_1px_var(--line)]")}>
      {body}
    </div>
  );
}

async function LevelContent({ params }: { params: Promise<Params> }) {
  const level = getLevel((await params).level);
  if (!level) notFound();
  const modules = getModules(level.slug);
  const stats = getCourseStats(level.slug);
  const theme = levelTheme[level.id];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line pt-10 pb-16">
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b to-transparent",
            theme.glow,
          )}
        />
        <Container>
          <Breadcrumbs
            items={[
              { label: "Курс", href: routes.catalog() },
              { label: level.title, href: routes.level(level.slug) },
            ]}
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
            <div className="flex flex-col gap-5">
              <LevelBadge
                levelId={level.id}
                title={`Уровень ${level.title}`}
                className="self-start"
              />
              <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
                {level.tagline}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">{level.description}</p>
              <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-fg-muted">
                <span className="font-medium text-fg">Для кого: </span>
                {level.audience}
              </p>
              {level.status === "published" ? (
                <p className="text-sm text-fg-subtle">
                  {formatCount(stats.modulesTotal, ["модуль", "модуля", "модулей"])} в программе ·
                  опубликовано {stats.modulesPublished} ·{" "}
                  {formatCount(stats.lessons, ["урок", "урока", "уроков"])} ·{" "}
                  {formatDuration(stats.minutes)}
                </p>
              ) : null}
            </div>
            {level.status === "published" ? (
              <Suspense fallback={<LevelProgressCardSkeleton />}>
                <LevelProgressCard level={level} modules={modules} />
              </Suspense>
            ) : (
              <SoonCard level={level} />
            )}
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="modules-title">
          <h2 id="modules-title" className="text-2xl font-semibold tracking-tight">
            Программа уровня
          </h2>
          {modules.length > 0 ? (
            <ol className="mt-6 flex flex-col gap-3">
              {modules.map((module, index) => (
                <li key={module.id}>
                  <ModuleRow module={module} index={index} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-fg-muted">Программа уровня готовится — следите за анонсами.</p>
          )}
        </section>
        <aside className="flex flex-col gap-4">
          <div className="surface-card p-6">
            <h2 className="font-semibold">Чему вы научитесь</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {level.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-2.5 text-[0.9375rem] leading-relaxed">
                  <Check
                    aria-hidden
                    className={cn("mt-1 size-4 shrink-0", theme.text)}
                    strokeWidth={2.5}
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
          {level.status === "published" ? (
            <div className="surface-card p-6">
              <h2 className="font-semibold">Сертификат</h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
                Пройдите тесты всех модулей и итоговый экзамен — сертификат выдаётся сразу, с
                публичной страницей проверки.
              </p>
            </div>
          ) : null}
        </aside>
      </Container>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: `${level.title}: ${level.tagline}`,
          description: level.description,
          url: absoluteUrl(routes.level(level.slug)),
          inLanguage: "ru",
          isAccessibleForFree: true,
          provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          syllabusSections: modules.map((module) => ({
            "@type": "Syllabus",
            name: module.title,
            description: module.summary,
          })),
        }}
      />
    </>
  );
}

function SoonCard({ level }: { level: Level }) {
  return (
    <div className="flex flex-col gap-4 surface-card p-6">
      <Badge className="self-start">Скоро</Badge>
      <p className="text-lg font-semibold tracking-tight">Уровень {level.title} готовится</p>
      <p className="text-[0.9375rem] leading-relaxed text-fg-muted">
        Пока пройдите Junior и Middle — Senior опирается на них. Анонс запуска появится в
        Telegram-канале проекта.
      </p>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href={routes.level("middle")}>Уровень Middle</ButtonLink>
        {siteConfig.telegram ? (
          <ButtonLink
            href={siteConfig.telegram as never}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram-канал
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
