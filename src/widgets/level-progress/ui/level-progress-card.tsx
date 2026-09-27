import { ArrowRight, Award, Lock } from "lucide-react";
import type { Level, Module } from "@/entities/course";
import { getUserCertificates } from "@/entities/certificate/index.server";
import { computeLevelProgress } from "@/entities/progress";
import { getCompletedLessons, getPassedQuizIds } from "@/entities/progress/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { routes } from "@/shared/config";
import { formatPercent } from "@/shared/lib";
import { AnimatedNumber, ButtonLink, ProgressBar, Skeleton } from "@/shared/ui";

export function moduleQuizId(module: Module) {
  return module.hasQuiz ? `${module.id}-quiz` : null;
}

/** Personal progress for a level. Reads the session — render inside <Suspense>. */
export async function LevelProgressCard({ level, modules }: { level: Level; modules: Module[] }) {
  const user = await getCurrentUser();
  const firstLesson = modules.flatMap((module) => module.lessons)[0];

  if (!user) {
    return (
      <div className="flex flex-col gap-4 surface-card p-6">
        <p className="text-lg font-semibold tracking-tight">Сохраняйте прогресс</p>
        <p className="text-[0.9375rem] leading-relaxed text-fg-muted">
          Уроки открыты всем. С бесплатным аккаунтом вы сможете отмечать пройденное, сдавать тесты и
          получить сертификат.
        </p>
        <div className="flex flex-wrap gap-2">
          {firstLesson ? (
            <ButtonLink
              href={routes.lesson(firstLesson.levelSlug, firstLesson.moduleSlug, firstLesson.slug)}
            >
              Первый урок <ArrowRight aria-hidden />
            </ButtonLink>
          ) : null}
          <ButtonLink href={routes.signIn(routes.level(level.slug))} variant="secondary">
            Войти
          </ButtonLink>
        </div>
      </div>
    );
  }

  const [completed, passed, certificates] = await Promise.all([
    getCompletedLessons(user.id),
    getPassedQuizIds(user.id),
    getUserCertificates(user.id),
  ]);
  const progress = computeLevelProgress(
    modules.map((module) => ({
      id: module.id,
      quizId: moduleQuizId(module),
      lessonIds: module.lessons.map((lesson) => lesson.id),
      status: module.status,
    })),
    completed,
    passed,
  );
  const certificate = certificates.find((item) => item.levelSlug === level.slug) ?? null;
  const next = progress.nextLessonId
    ? modules
        .flatMap((module) => module.lessons)
        .find((lesson) => lesson.id === progress.nextLessonId)
    : null;

  return (
    <div className="flex flex-col gap-5 surface-card p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-fg-muted">Ваш прогресс</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.04em] tabular-nums">
            <AnimatedNumber value={Math.round(progress.ratio * 100)} suffix="%" />
          </p>
        </div>
        <p className="text-right text-sm text-fg-muted">
          уроки {progress.lessonsDone}/{progress.lessonsTotal}
          <br />
          тесты {progress.quizzesPassed}/{progress.quizzesTotal}
        </p>
      </div>
      <ProgressBar
        value={progress.ratio}
        tone={level.id}
        label={`Прогресс уровня ${formatPercent(progress.ratio)}`}
      />
      <div className="flex flex-wrap gap-2">
        {certificate ? (
          <ButtonLink href={routes.certificate(certificate.code)} variant="soft">
            <Award aria-hidden /> Ваш сертификат
          </ButtonLink>
        ) : next ? (
          <ButtonLink href={routes.lesson(next.levelSlug, next.moduleSlug, next.slug)}>
            Продолжить <ArrowRight aria-hidden />
          </ButtonLink>
        ) : null}
        {!certificate ? (
          progress.examUnlocked ? (
            <ButtonLink href={routes.levelExam(level.slug)} variant="secondary">
              Итоговый экзамен
            </ButtonLink>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-1 text-sm text-fg-muted">
              <Lock aria-hidden className="size-3.5" /> Экзамен откроется после тестов всех модулей
            </span>
          )
        ) : null}
      </div>
    </div>
  );
}

export function LevelProgressCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 surface-card p-6">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
  );
}
