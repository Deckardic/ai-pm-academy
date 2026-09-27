import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { getAllModules, getLevel, getModule, getModules } from "@/entities/course/index.server";
import { LevelBadge, type Module } from "@/entities/course";
import { getModuleQuiz } from "@/entities/quiz/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { routes } from "@/shared/config";
import { formatCount } from "@/shared/lib";
import { Breadcrumbs, ButtonLink, Container, PageSkeleton, Skeleton } from "@/shared/ui";
import { ModuleQuizRunner } from "@/widgets/quiz-runner";

type Params = { level: string; module: string };

export function generateModuleQuizParams(): Params[] {
  return getAllModules()
    .filter((mod) => mod.hasQuiz)
    .map((mod) => ({ level: mod.levelSlug, module: mod.slug }));
}

export async function generateModuleQuizMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { level, module: mod } = await params;
  const data = getModule(level, mod);
  return data ? { title: `Тест: ${data.title}`, robots: { index: false, follow: true } } : {};
}

export function ModuleQuizPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PageSkeleton size="narrow" />}>
      <Content params={params} />
    </Suspense>
  );
}

function nextStep(mod: Module, modules: Module[]) {
  const index = modules.findIndex((item) => item.id === mod.id);
  const nextModule = modules.slice(index + 1).find((item) => item.status === "published");
  return nextModule
    ? {
        href: routes.module(nextModule.levelSlug, nextModule.slug),
        label: `Модуль «${nextModule.title}»`,
      }
    : { href: routes.level(mod.levelSlug), label: "К программе уровня" };
}

async function Runner({ mod, intro }: { mod: Module; intro: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        {intro}
        <div className="flex flex-col items-start gap-3 rounded-xl bg-accent-soft p-5">
          <p className="text-[0.9375rem]">
            Тесты сохраняются в личном кабинете — войдите или создайте бесплатный аккаунт.
          </p>
          <ButtonLink href={routes.signIn(routes.moduleQuiz(mod.levelSlug, mod.slug))}>
            <LogIn aria-hidden /> Войти и начать
          </ButtonLink>
        </div>
      </div>
    );
  }
  const lessonLinks = Object.fromEntries(
    mod.lessons.map((lesson) => [
      lesson.id,
      {
        href: routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug),
        title: lesson.title,
      },
    ]),
  );
  return (
    <ModuleQuizRunner
      intro={intro}
      levelSlug={mod.levelSlug}
      moduleSlug={mod.slug}
      lessonLinks={lessonLinks}
      next={nextStep(mod, getModules(mod.levelSlug))}
    />
  );
}

async function Content({ params }: { params: Promise<Params> }) {
  const { level: levelSlug, module: moduleSlug } = await params;
  const level = getLevel(levelSlug);
  const mod = getModule(levelSlug, moduleSlug);
  const quiz = mod ? getModuleQuiz(mod.dir) : null;
  if (!level || !mod || !quiz) notFound();

  const intro = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LevelBadge levelId={level.id} title={level.title} />
        <span className="text-sm text-fg-muted">Тест модуля</span>
      </div>
      <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
        {mod.title}
      </h1>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem] text-fg-muted">
        <li>{formatCount(quiz.questionsPerAttempt, ["вопрос", "вопроса", "вопросов"])}</li>
        <li>проходной балл {Math.round(quiz.passScore * 100)}%</li>
        <li>попыток — сколько угодно</li>
      </ul>
      <p className="max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
        Вопросы и варианты перемешиваются в каждой попытке. После теста — разбор каждого ответа со
        ссылкой на урок.
      </p>
    </div>
  );

  return (
    <Container size="narrow" className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: level.title, href: routes.level(level.slug) },
          { label: mod.title, href: routes.module(level.slug, mod.slug) },
          { label: "Тест", href: routes.moduleQuiz(level.slug, mod.slug) },
        ]}
      />
      <div className="mt-10">
        <Suspense
          fallback={
            <div className="flex flex-col gap-6">
              {intro}
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
          }
        >
          <Runner mod={mod} intro={intro} />
        </Suspense>
      </div>
    </Container>
  );
}
