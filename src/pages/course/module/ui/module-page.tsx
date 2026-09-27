import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, PenLine } from "lucide-react";
import { getAllModules, getAssignment, getLevel, getModule } from "@/entities/course/index.server";
import { LevelBadge, type Module } from "@/entities/course";
import {
  getCompletedLessons,
  getPassedQuizIds,
  getSubmission,
} from "@/entities/progress/index.server";
import { getModuleQuiz } from "@/entities/quiz/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { routes } from "@/shared/config";
import { cn, formatCount, formatDuration } from "@/shared/lib";
import { Badge, Breadcrumbs, Container, Skeleton } from "@/shared/ui";
import { ModuleOutline } from "@/widgets/module-outline";

type Params = { level: string; module: string };

export function generateModuleParams(): Params[] {
  return getAllModules().map((mod) => ({ level: mod.levelSlug, module: mod.slug }));
}

export async function generateModuleMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { level, module: mod } = await params;
  const data = getModule(level, mod);
  if (!data) return {};
  return {
    title: data.title,
    description: data.summary,
    alternates: { canonical: routes.module(level, mod) },
    robots: data.status === "planned" ? { index: false, follow: true } : undefined,
  };
}

export function ModulePage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense
      fallback={
        <Container className="py-16">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </Container>
      }
    >
      <ModuleContent params={params} />
    </Suspense>
  );
}

async function LessonsWithProgress({ mod }: { mod: Module }) {
  const user = await getCurrentUser();
  const completed = user ? await getCompletedLessons(user.id) : undefined;
  return <ModuleOutline lessons={mod.lessons} completed={completed} />;
}

async function ModuleActions({ mod }: { mod: Module }) {
  const user = await getCurrentUser();
  const quiz = getModuleQuiz(mod.dir);
  const assignment = getAssignment(mod);
  const [passed, submission] = user
    ? await Promise.all([
        getPassedQuizIds(user.id),
        assignment ? getSubmission(user.id, assignment.id) : Promise.resolve(null),
      ])
    : [new Set<string>(), null];

  const cards = [
    assignment
      ? {
          href: routes.moduleAssignment(mod.levelSlug, mod.slug),
          icon: PenLine,
          title: "Практическое задание",
          text: `${assignment.title} · ${formatDuration(assignment.durationMin)}`,
          done: Boolean(submission),
          doneLabel: "Сдано",
        }
      : null,
    quiz
      ? {
          href: routes.moduleQuiz(mod.levelSlug, mod.slug),
          icon: ClipboardCheck,
          title: "Тест модуля",
          text: `${formatCount(quiz.questionsPerAttempt, ["вопрос", "вопроса", "вопросов"])} · проходной балл ${Math.round(quiz.passScore * 100)}%`,
          done: passed.has(quiz.id),
          doneLabel: "Пройден",
        }
      : null,
  ].filter((card): card is NonNullable<typeof card> => card !== null);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group flex flex-col gap-3 surface-card p-5 transition-shadow duration-200 ease-out hover:shadow-card-hover"
        >
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <card.icon aria-hidden className="size-5" />
            </span>
            {card.done ? (
              <Badge tone="success" size="sm">
                <CheckCircle2 aria-hidden /> {card.doneLabel}
              </Badge>
            ) : (
              <ArrowRight
                aria-hidden
                className="size-4 text-fg-subtle transition-colors duration-150 ease-[ease] group-hover:text-fg"
              />
            )}
          </div>
          <div>
            <p className="font-semibold">{card.title}</p>
            <p className="mt-1 text-sm text-fg-muted">{card.text}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function ModuleContent({ params }: { params: Promise<Params> }) {
  const { level: levelSlug, module: moduleSlug } = await params;
  const level = getLevel(levelSlug);
  const mod = getModule(levelSlug, moduleSlug);
  if (!level || !mod) notFound();
  const published = mod.status === "published";

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: "Курс", href: routes.catalog() },
          { label: level.title, href: routes.level(level.slug) },
          { label: mod.title, href: routes.module(level.slug, mod.slug) },
        ]}
      />
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge levelId={level.id} title={level.title} />
              <span className="text-sm text-fg-muted">Модуль {mod.order}</span>
              {!published ? <Badge size="sm">Готовится</Badge> : null}
            </div>
            <h1 className="text-[clamp(2rem,4.5vw,3rem)] leading-[1.06] font-semibold tracking-[-0.035em]">
              {mod.title}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">{mod.summary}</p>
          </header>

          {published ? (
            <>
              <section aria-labelledby="lessons-title">
                <h2 id="lessons-title" className="text-xl font-semibold tracking-tight">
                  Уроки
                </h2>
                <div className="mt-4">
                  <Suspense fallback={<ModuleOutline lessons={mod.lessons} />}>
                    <LessonsWithProgress mod={mod} />
                  </Suspense>
                </div>
              </section>
              {mod.hasQuiz || mod.hasAssignment ? (
                <section aria-labelledby="practice-title">
                  <h2 id="practice-title" className="text-xl font-semibold tracking-tight">
                    Практика и проверка
                  </h2>
                  <div className="mt-4">
                    <Suspense fallback={<Skeleton className="h-36 w-full rounded-xl" />}>
                      <ModuleActions mod={mod} />
                    </Suspense>
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <section className="rounded-xl p-6 shadow-[inset_0_0_0_1px_var(--line)]">
              <h2 className="font-semibold">План модуля</h2>
              <p className="mt-1 text-sm text-fg-muted">Уроки готовятся и появятся здесь.</p>
              <ol className="mt-4 flex flex-col gap-2">
                {mod.lessonsPlan.map((lesson, index) => (
                  <li key={lesson.title} className="flex gap-3 text-[0.9375rem]">
                    <span className="text-fg-subtle tabular-nums">{index + 1}.</span>
                    {lesson.title}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="surface-card p-6">
            <h2 className="font-semibold">Цели модуля</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {mod.goals.map((goal) => (
                <li key={goal} className="flex gap-2.5 text-[0.9375rem] leading-relaxed">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          {mod.artifact ? (
            <div className={cn("flex gap-3 surface-card p-6")}>
              <FileText aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <h2 className="font-semibold">Артефакт для портфолио</h2>
                <p className="mt-1 text-[0.9375rem] text-fg-muted">{mod.artifact}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}
