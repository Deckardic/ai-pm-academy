import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CalendarCheck, Clock, LogIn } from "lucide-react";
import { getAllLessons, getLessonContext } from "@/entities/course/index.server";
import { LevelBadge, type LessonContext, type LessonMeta } from "@/entities/course";
import { getCompletedLessons, isLessonCompleted } from "@/entities/progress/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { CompleteLessonButton } from "@/features/complete-lesson";
import { LessonRating, ReportErrorDialog } from "@/features/lesson-feedback";
import { absoluteUrl, routes, siteConfig } from "@/shared/config";
import { extractHeadings } from "@/shared/content/index.server";
import { formatDate, formatDuration, JsonLd } from "@/shared/lib";
import { Breadcrumbs, ButtonLink, Container, Skeleton } from "@/shared/ui";
import { LessonBody } from "@/widgets/lesson-body";
import { LessonToc } from "@/widgets/lesson-toc";
import { ModuleOutline } from "@/widgets/module-outline";
import { LessonMaterials } from "./lesson-materials";

type Params = { level: string; module: string; lesson: string };

export function generateLessonParams(): Params[] {
  return getAllLessons().map((lesson) => ({
    level: lesson.levelSlug,
    module: lesson.moduleSlug,
    lesson: lesson.slug,
  }));
}

export async function generateLessonMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { level, module, lesson } = await params;
  const context = getLessonContext(level, module, lesson);
  if (!context) return {};
  const url = routes.lesson(level, module, lesson);
  return {
    title: context.lesson.title,
    description: context.lesson.description,
    keywords: context.lesson.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: context.lesson.title,
      description: context.lesson.description,
      url,
      modifiedTime: context.lesson.revisedAt,
    },
  };
}

function lessonHref(lesson: LessonMeta) {
  return routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug);
}

async function CompletionSection({ context }: { context: LessonContext }) {
  const user = await getCurrentUser();
  const here = lessonHref(context.lesson);
  if (!user) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.9375rem]">
          <span className="font-medium">Сохраняйте прогресс.</span>{" "}
          <span className="text-fg-muted">Аккаунт бесплатный — понадобится и для тестов.</span>
        </p>
        <ButtonLink href={routes.signIn(here)} size="sm">
          <LogIn aria-hidden /> Войти
        </ButtonLink>
      </div>
    );
  }
  const completed = await isLessonCompleted(user.id, context.lesson.id);
  return (
    <CompleteLessonButton
      lessonId={context.lesson.id}
      completed={completed}
      next={context.next ? { href: lessonHref(context.next), title: context.next.title } : null}
    />
  );
}

async function ModuleNav({ context }: { context: LessonContext }) {
  const user = await getCurrentUser();
  const completed = user ? await getCompletedLessons(user.id) : undefined;
  return (
    <ModuleOutline
      lessons={context.module.lessons}
      completed={completed}
      currentId={context.lesson.id}
      variant="compact"
    />
  );
}

/**
 * Known lessons are fully prerendered (generateStaticParams); the Suspense
 * boundary gives unknown URLs an instant shell while they resolve to 404.
 */
export function LessonPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContent params={params} />
    </Suspense>
  );
}

function LessonSkeleton() {
  return (
    <Container size="wide" className="grid gap-12 py-14 lg:grid-cols-[15rem_minmax(0,1fr)_14rem]">
      <div className="hidden lg:block" />
      <div className="flex max-w-[44rem] flex-col gap-5">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </Container>
  );
}

async function LessonContent({ params }: { params: Promise<Params> }) {
  const { level, module, lesson } = await params;
  const context = getLessonContext(level, module, lesson);
  if (!context) notFound();
  const headings = extractHeadings(context.lesson.body);
  const index = context.module.lessons.findIndex((item) => item.id === context.lesson.id);

  return (
    <>
      <div
        aria-hidden
        className="reading-progress fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-30 h-0.5 bg-accent"
      />
      <Container
        size="wide"
        className="grid gap-12 py-10 lg:grid-cols-[15rem_minmax(0,1fr)_14rem] lg:py-14"
      >
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-3">
            <Link
              href={routes.module(context.level.slug, context.module.slug)}
              className="px-2.5 text-sm font-medium text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg"
            >
              {context.module.title}
            </Link>
            <Suspense
              fallback={
                <ModuleOutline
                  lessons={context.module.lessons}
                  currentId={context.lesson.id}
                  variant="compact"
                />
              }
            >
              <ModuleNav context={context} />
            </Suspense>
          </div>
        </aside>

        <article className="min-w-0">
          <Breadcrumbs
            items={[
              { label: "Курс", href: routes.catalog() },
              { label: context.level.title, href: routes.level(context.level.slug) },
              {
                label: context.module.title,
                href: routes.module(context.level.slug, context.module.slug),
              },
              { label: context.lesson.title, href: lessonHref(context.lesson) },
            ]}
          />
          <header className="mt-8 flex max-w-[44rem] flex-col gap-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-muted">
              <LevelBadge levelId={context.level.id} title={context.level.title} />
              <span>
                Урок {index + 1} из {context.module.lessons.length}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="size-3.5" />{" "}
                {formatDuration(context.lesson.durationMin)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarCheck aria-hidden className="size-3.5" /> Обновлено{" "}
                {formatDate(context.lesson.revisedAt)}
              </span>
            </div>
            <h1 className="text-[clamp(2rem,4.5vw,2.875rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
              {context.lesson.title}
            </h1>
            <p className="text-lg leading-relaxed text-fg-muted">{context.lesson.description}</p>
            <div className="rounded-xl bg-bg-subtle p-5 shadow-sm">
              <p className="text-sm font-semibold">Что вы узнаете</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-[0.9375rem] text-fg/85">
                {context.lesson.goals.map((goal) => (
                  <li key={goal} className="flex gap-2.5">
                    <span
                      aria-hidden
                      className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <div className="mt-10">
            <LessonBody source={context.lesson.body} />
          </div>

          {context.lesson.sources.length > 0 ? (
            <section className="mt-10 max-w-[44rem] text-sm text-fg-muted">
              <h2 className="font-semibold text-fg">Источники</h2>
              <ul className="mt-2 flex flex-col gap-1">
                {context.lesson.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-fg"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <LessonMaterials lessonId={context.lesson.id} body={context.lesson.body} />

          <footer className="mt-12 flex max-w-[44rem] flex-col gap-8 border-t border-line pt-8">
            <Suspense fallback={<Skeleton className="h-12 w-64 rounded-xl" />}>
              <CompletionSection context={context} />
            </Suspense>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <LessonRating lessonId={context.lesson.id} />
              <ReportErrorDialog targetId={context.lesson.id} />
            </div>
            <nav aria-label="Соседние уроки" className="grid gap-3 sm:grid-cols-2">
              {context.prev ? (
                <Link
                  href={lessonHref(context.prev)}
                  className="group flex flex-col gap-1 surface-card p-4 transition-shadow duration-200 ease-out hover:shadow-card-hover"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
                    <ArrowLeft aria-hidden className="size-3.5" /> Предыдущий
                  </span>
                  <span className="font-medium">{context.prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {context.next ? (
                <Link
                  href={lessonHref(context.next)}
                  className="group flex flex-col items-end gap-1 surface-card p-4 text-right transition-shadow duration-200 ease-out hover:shadow-card-hover"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
                    Следующий <ArrowRight aria-hidden className="size-3.5" />
                  </span>
                  <span className="font-medium">{context.next.title}</span>
                </Link>
              ) : (
                <Link
                  href={routes.module(context.level.slug, context.module.slug)}
                  className="flex flex-col items-end gap-1 surface-card p-4 text-right transition-shadow duration-200 ease-out hover:shadow-card-hover"
                >
                  <span className="text-sm text-fg-muted">Модуль завершён</span>
                  <span className="font-medium">К тесту модуля</span>
                </Link>
              )}
            </nav>
          </footer>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <LessonToc headings={headings} />
          </div>
        </aside>
      </Container>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: context.lesson.title,
          description: context.lesson.description,
          url: absoluteUrl(lessonHref(context.lesson)),
          inLanguage: "ru",
          isAccessibleForFree: true,
          learningResourceType: "Lesson",
          educationalLevel: context.level.title,
          timeRequired: `PT${context.lesson.durationMin}M`,
          dateModified: context.lesson.revisedAt,
          teaches: context.lesson.goals,
          keywords: context.lesson.keywords.join(", "),
          isPartOf: {
            "@type": "Course",
            name: `${context.level.title}: ${context.level.tagline}`,
            url: absoluteUrl(routes.level(context.level.slug)),
          },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />
    </>
  );
}
