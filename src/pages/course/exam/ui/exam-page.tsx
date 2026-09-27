import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Award, Lock, LogIn } from "lucide-react";
import { getLevel, getLevels, getModules } from "@/entities/course/index.server";
import { LevelBadge, type Level } from "@/entities/course";
import { getUserCertificates } from "@/entities/certificate/index.server";
import { getPassedQuizIds } from "@/entities/progress/index.server";
import { getLevelExam } from "@/entities/quiz/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { routes } from "@/shared/config";
import { formatCount } from "@/shared/lib";
import { Breadcrumbs, ButtonLink, Container, PageSkeleton, Skeleton } from "@/shared/ui";
import { ExamRunner } from "@/widgets/quiz-runner";

type Params = { level: string };

export function generateExamParams(): Params[] {
  return getLevels()
    .filter((level) => level.status === "published")
    .map((level) => ({ level: level.slug }));
}

export async function generateExamMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const level = getLevel((await params).level);
  return level
    ? { title: `Итоговый экзамен ${level.title}`, robots: { index: false, follow: true } }
    : {};
}

export function ExamPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PageSkeleton size="narrow" />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Gate({ level, intro }: { level: Level; intro: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        {intro}
        <ButtonLink href={routes.signIn(routes.levelExam(level.slug))} className="self-start">
          <LogIn aria-hidden /> Войти, чтобы сдать экзамен
        </ButtonLink>
      </div>
    );
  }
  const modules = getModules(level.slug);
  const [passed, certificates] = await Promise.all([
    getPassedQuizIds(user.id),
    getUserCertificates(user.id),
  ]);
  const certificate = certificates.find((item) => item.levelSlug === level.slug);
  if (certificate) {
    return (
      <div className="flex flex-col gap-6">
        {intro}
        <div className="flex flex-col items-start gap-3 rounded-xl bg-success-soft p-5">
          <p className="text-[0.9375rem]">Экзамен сдан — сертификат уже ваш.</p>
          <ButtonLink href={routes.certificate(certificate.code)}>
            <Award aria-hidden /> Открыть сертификат
          </ButtonLink>
        </div>
      </div>
    );
  }
  const missing = modules.filter((module) => module.hasQuiz && !passed.has(`${module.id}-quiz`));
  if (missing.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        {intro}
        <div className="flex flex-col gap-4 surface-card p-6">
          <p className="flex items-center gap-2 font-semibold">
            <Lock aria-hidden className="size-4" /> Экзамен откроется после тестов модулей
          </p>
          <ul className="flex flex-col gap-2">
            {missing.map((module) => (
              <li key={module.id}>
                <a
                  href={routes.moduleQuiz(level.slug, module.slug)}
                  className="text-[0.9375rem] text-accent hover:underline"
                >
                  Тест: {module.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  const lessonLinks = Object.fromEntries(
    modules
      .flatMap((module) => module.lessons)
      .map((lesson) => [
        lesson.id,
        {
          href: routes.lesson(lesson.levelSlug, lesson.moduleSlug, lesson.slug),
          title: lesson.title,
        },
      ]),
  );
  return <ExamRunner intro={intro} levelSlug={level.slug} lessonLinks={lessonLinks} />;
}

async function Content({ params }: { params: Promise<Params> }) {
  const level = getLevel((await params).level);
  const exam = level ? getLevelExam(level.dir) : null;
  if (!level || !exam || level.status !== "published") notFound();

  const intro = (
    <div className="flex flex-col gap-4">
      <LevelBadge
        levelId={level.id}
        title={`Итоговый экзамен · ${level.title}`}
        className="self-start"
      />
      <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
        {level.tagline}
      </h1>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem] text-fg-muted">
        <li>
          {formatCount(exam.questionsPerAttempt, ["вопрос", "вопроса", "вопросов"])}, много
          ситуационных
        </li>
        <li>{exam.timeLimitMin} минут</li>
        <li>проходной балл {Math.round(exam.passScore * 100)}%</li>
        <li>пересдача через {exam.cooldownHours} ч</li>
      </ul>
      <p className="max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
        Таймер запустится после нажатия кнопки. Если время выйдет, ответы отправятся автоматически.
        После сдачи сертификат выдаётся сразу.
      </p>
    </div>
  );

  return (
    <Container size="narrow" className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: level.title, href: routes.level(level.slug) },
          { label: "Итоговый экзамен", href: routes.levelExam(level.slug) },
        ]}
      />
      <div className="mt-10">
        <Suspense
          fallback={
            <div className="flex flex-col gap-6">
              {intro}
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          }
        >
          <Gate level={level} intro={intro} />
        </Suspense>
      </div>
    </Container>
  );
}
