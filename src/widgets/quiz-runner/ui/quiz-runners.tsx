"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Route } from "next";
import { ArrowRight, Award } from "lucide-react";
import { QuizFlow, type Answers, type PlacementResult } from "@/entities/quiz";
import { ReportErrorDialog } from "@/features/lesson-feedback";
import { startPlacement, submitPlacement } from "@/features/placement-test";
import { startQuiz, submitQuiz, type ExamExtra } from "@/features/take-quiz";
import { routes } from "@/shared/config";
import { ButtonLink } from "@/shared/ui";

type LessonLinks = Record<string, { href: string; title: string }>;

const reportQuestion = (questionId: string) => (
  <ReportErrorDialog targetId={questionId} kind="question-error" label="Ошибка в вопросе?" />
);

export function ModuleQuizRunner({
  intro,
  levelSlug,
  moduleSlug,
  lessonLinks,
  next,
}: {
  intro: ReactNode;
  levelSlug: string;
  moduleSlug: string;
  lessonLinks: LessonLinks;
  next: { href: Route; label: string };
}) {
  return (
    <QuizFlow
      intro={intro}
      startLabel="Начать тест"
      start={() => startQuiz({ kind: "module", levelSlug, moduleSlug })}
      submit={(attemptId, answers: Answers) => submitQuiz({ attemptId, answers })}
      lessonLinks={lessonLinks}
      renderQuestionExtra={reportQuestion}
      renderSummary={(result) =>
        result.passed ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[0.9375rem] text-fg-muted">Тест засчитан. Можно двигаться дальше.</p>
            <ButtonLink href={next.href}>
              {next.label} <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
        ) : (
          <p className="text-[0.9375rem] text-fg-muted">
            Нужно {Math.ceil(0.7 * result.total)} верных ответов из {result.total}. Посмотрите
            разбор, повторите уроки и попробуйте снова — вопросы будут другими.
          </p>
        )
      }
    />
  );
}

export function ExamRunner({
  intro,
  levelSlug,
  lessonLinks,
}: {
  intro: ReactNode;
  levelSlug: string;
  lessonLinks: LessonLinks;
}) {
  return (
    <QuizFlow<ExamExtra>
      intro={intro}
      startLabel="Начать экзамен"
      start={() => startQuiz({ kind: "exam", levelSlug })}
      submit={(attemptId, answers: Answers) => submitQuiz({ attemptId, answers })}
      lessonLinks={lessonLinks}
      renderQuestionExtra={reportQuestion}
      renderSummary={(result, extra) =>
        result.passed && extra?.certificateCode ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[0.9375rem]">
              <span className="font-semibold">Поздравляем!</span>{" "}
              <span className="text-fg-muted">
                Сертификат уже готов, у него есть публичная страница проверки.
              </span>
            </p>
            <ButtonLink href={routes.certificate(extra.certificateCode)}>
              <Award aria-hidden /> Открыть сертификат
            </ButtonLink>
          </div>
        ) : (
          <p className="text-[0.9375rem] text-fg-muted">
            Для сдачи нужно 75% верных ответов. Следующая попытка будет доступна через 24 часа —
            используйте это время, чтобы повторить уроки из разбора.
          </p>
        )
      }
    />
  );
}

const levelNames = { junior: "Junior", middle: "Middle", senior: "Senior" } as const;

export function PlacementRunner({ intro }: { intro: ReactNode }) {
  return (
    <QuizFlow<PlacementResult>
      intro={intro}
      startLabel="Пройти тест"
      graded={false}
      start={() => startPlacement()}
      submit={(_attemptId, answers: Answers) => submitPlacement(answers)}
      renderSummary={(_result, placement) => {
        if (!placement) return null;
        const recommended = placement.recommended === "senior" ? "middle" : placement.recommended;
        const area = (bucket: { correct: number; total: number }) =>
          bucket.total === 0 ? "—" : `${bucket.correct} из ${bucket.total}`;
        return (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-fg-muted">Рекомендуем начать с уровня</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {levelNames[recommended]}
              </p>
              {placement.recommended === "senior" ? (
                <p className="mt-2 text-[0.9375rem] text-fg-muted">
                  Вы уверенно ответили и на вопросы уровня Senior. Он скоро откроется — пока
                  закрепите Middle и практику с ИИ-воркфлоу.
                </p>
              ) : null}
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-bg-subtle p-4">
                <dt className="text-fg-muted">Управление проектами</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {area(placement.byArea.pm)}
                </dd>
              </div>
              <div className="rounded-xl bg-bg-subtle p-4">
                <dt className="text-fg-muted">Работа с ИИ</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {area(placement.byArea.ai)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={routes.level(recommended)}>
                Перейти к {levelNames[recommended]} <ArrowRight aria-hidden />
              </ButtonLink>
              <Link
                href={routes.signIn()}
                className="inline-flex items-center px-2 text-[0.9375rem] font-medium text-accent hover:underline"
              >
                Создать аккаунт, чтобы сохранять прогресс
              </Link>
            </div>
          </div>
        );
      }}
    />
  );
}
