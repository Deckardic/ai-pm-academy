"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, RotateCcw, X } from "lucide-react";
import { cn } from "@/shared/lib";
import { AnimatedNumber, Badge, Button, FieldError, LoadingButton, ProgressBar } from "@/shared/ui";
import type { Answer, Answers, GradeResult, PublicQuestion } from "../model/public";
import { initialAnswer, isAnswered, QuestionView } from "./question-view";

export type StartResult =
  | { ok: true; attemptId: string; questions: PublicQuestion[]; deadline?: string | null }
  | { ok: false; error: string };

export type SubmitResult<Extra = unknown> =
  { ok: true; result: GradeResult; extra?: Extra } | { ok: false; error: string };

type QuizFlowProps<Extra> = {
  intro: ReactNode;
  startLabel?: string;
  start: () => Promise<StartResult>;
  submit: (attemptId: string, answers: Answers) => Promise<SubmitResult<Extra>>;
  renderSummary?: (result: GradeResult, extra: Extra | undefined) => ReactNode;
  renderQuestionExtra?: (questionId: string) => ReactNode;
  lessonLinks?: Record<string, { href: string; title: string }>;
  /** Placement tests have no pass/fail. */
  graded?: boolean;
};

type Phase<Extra> =
  | { name: "intro" }
  | {
      name: "question";
      attemptId: string;
      questions: PublicQuestion[];
      index: number;
      deadline: number | null;
    }
  | { name: "result"; result: GradeResult; extra?: Extra; questions: PublicQuestion[] };

export function QuizFlow<Extra = unknown>({
  intro,
  startLabel = "Начать",
  start,
  submit,
  renderSummary,
  renderQuestionExtra,
  lessonLinks = {},
  graded = true,
}: QuizFlowProps<Extra>) {
  const [phase, setPhase] = useState<Phase<Extra>>({ name: "intro" });
  const [answers, setAnswers] = useState<Answers>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });

  async function onStart() {
    setPending(true);
    setError(null);
    const response = await start();
    setPending(false);
    if (!response.ok) return setError(response.error);
    const initial: Answers = {};
    for (const question of response.questions) {
      const value = initialAnswer(question);
      if (value !== undefined) initial[question.id] = value;
    }
    setAnswers(initial);
    setPhase({
      name: "question",
      attemptId: response.attemptId,
      questions: response.questions,
      index: 0,
      deadline: response.deadline ? new Date(response.deadline).getTime() : null,
    });
  }

  const onSubmit = useCallback(async () => {
    if (phase.name !== "question") return;
    setPending(true);
    setError(null);
    const response = await submit(phase.attemptId, answers);
    setPending(false);
    if (!response.ok) return setError(response.error);
    setPhase({
      name: "result",
      result: response.result,
      extra: response.extra,
      questions: phase.questions,
    });
    scrollTop();
  }, [answers, phase, submit]);

  if (phase.name === "intro") {
    return (
      <div ref={topRef} className="flex scroll-mt-24 flex-col gap-6">
        {intro}
        <div className="flex flex-col items-start gap-3">
          <LoadingButton size="lg" pending={pending} onClick={onStart}>
            {startLabel} <ArrowRight aria-hidden />
          </LoadingButton>
          <FieldError message={error} />
        </div>
      </div>
    );
  }

  if (phase.name === "result") {
    return (
      <div ref={topRef} className="scroll-mt-24">
        <ResultView
          result={phase.result}
          questions={phase.questions}
          graded={graded}
          summary={renderSummary?.(phase.result, phase.extra)}
          renderQuestionExtra={renderQuestionExtra}
          lessonLinks={lessonLinks}
          onRetry={() => {
            setPhase({ name: "intro" });
            setAnswers({});
          }}
        />
      </div>
    );
  }

  const question = phase.questions[phase.index]!;
  const last = phase.index === phase.questions.length - 1;
  const answered = isAnswered(question, answers[question.id]);
  const go = (delta: 1 | -1) => {
    setDirection(delta);
    setPhase({ ...phase, index: phase.index + delta });
  };

  return (
    <div ref={topRef} className="flex scroll-mt-24 flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 text-sm text-fg-muted">
          <span className="tabular-nums">
            Вопрос {phase.index + 1} из {phase.questions.length}
          </span>
          {phase.deadline ? <Countdown deadline={phase.deadline} onExpire={onSubmit} /> : null}
        </div>
        <ProgressBar
          value={(phase.index + (answered ? 1 : 0)) / phase.questions.length}
          size="sm"
          label="Прогресс теста"
        />
      </div>

      {/* Keyed by question: enters from the side it was navigated towards. */}
      <div
        key={question.id}
        className={cn(
          "transition-[opacity,transform] duration-250 ease-out motion-reduce:transition-opacity",
          direction === 1 ? "starting:translate-x-3" : "starting:-translate-x-3",
          "starting:opacity-0",
        )}
      >
        <QuestionView
          question={question}
          answer={answers[question.id]}
          onAnswer={(answer: Answer) => setAnswers((prev) => ({ ...prev, [question.id]: answer }))}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
        <Button variant="ghost" onClick={() => go(-1)} disabled={phase.index === 0}>
          <ArrowLeft aria-hidden /> Назад
        </Button>
        {last ? (
          <LoadingButton pending={pending} onClick={onSubmit} disabled={!answered}>
            Завершить <Check aria-hidden />
          </LoadingButton>
        ) : (
          <Button onClick={() => go(1)} disabled={!answered}>
            Далее <ArrowRight aria-hidden />
          </Button>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function Countdown({ deadline, onExpire }: { deadline: number; onExpire: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const expired = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = Math.max(0, deadline - now);
  useEffect(() => {
    if (left === 0 && !expired.current) {
      expired.current = true;
      onExpire();
    }
  }, [left, onExpire]);
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return (
    <span
      role="timer"
      aria-label={`Осталось ${minutes} мин`}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium tabular-nums transition-colors duration-300 ease-[ease]",
        left < 5 * 60000 && "text-warning",
        left < 60000 && "text-danger",
      )}
    >
      <Clock aria-hidden className="size-3.5" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

function ResultView({
  result,
  questions,
  graded,
  summary,
  renderQuestionExtra,
  lessonLinks,
  onRetry,
}: {
  result: GradeResult;
  questions: PublicQuestion[];
  graded: boolean;
  summary?: ReactNode;
  renderQuestionExtra?: (questionId: string) => ReactNode;
  lessonLinks: Record<string, { href: string; title: string }>;
  onRetry: () => void;
}) {
  const [shown, setShown] = useState(0);
  // Count up once, right after the result appears — a rare, earned moment.
  useEffect(() => {
    const timer = setTimeout(() => setShown(Math.round(result.score * 100)), 120);
    return () => clearTimeout(timer);
  }, [result.score]);
  const byId = new Map(questions.map((question) => [question.id, question]));

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden surface-card p-6 sm:p-8">
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-1",
            !graded ? "bg-accent" : result.passed ? "bg-success" : "bg-warning",
          )}
        />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm text-fg-muted">Результат</p>
            <p className="mt-1 text-6xl font-semibold tracking-[-0.05em] tabular-nums">
              <AnimatedNumber value={shown} suffix="%" />
            </p>
            <p className="mt-1 text-sm text-fg-muted tabular-nums">
              {result.correctCount} из {result.total} верно
            </p>
          </div>
          {graded ? (
            result.passed ? (
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-success-soft text-success">
                  <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                      className="animate-[draw_450ms_var(--ease-out)_200ms_forwards] [stroke-dasharray:1] [stroke-dashoffset:1] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Тест пройден</p>
                  <p className="text-sm text-fg-muted">Отличная работа</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <Badge tone="warning">Пока не пройден</Badge>
                <Button variant="secondary" size="sm" onClick={onRetry}>
                  <RotateCcw aria-hidden /> Попробовать снова
                </Button>
              </div>
            )
          ) : null}
        </div>
        {summary ? <div className="mt-6 border-t border-line pt-6">{summary}</div> : null}
      </div>

      <section aria-labelledby="review-title">
        <h2 id="review-title" className="text-xl font-semibold tracking-tight">
          Разбор ответов
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {result.results.map((item, index) => {
            const question = byId.get(item.questionId);
            const lesson = item.lessonId ? lessonLinks[item.lessonId] : undefined;
            return (
              <li key={item.questionId} className="flex flex-col gap-3 surface-card p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-white",
                      item.correct ? "bg-success" : "bg-danger",
                    )}
                  >
                    {item.correct ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      <X className="size-3.5" strokeWidth={3} />
                    )}
                  </span>
                  <p className="font-medium">
                    <span className="text-fg-subtle tabular-nums">{index + 1}. </span>
                    {question?.prompt}
                  </p>
                </div>
                <div className="flex flex-col gap-2 pl-9 text-[0.9375rem] leading-relaxed">
                  {!item.correct ? (
                    <p>
                      <span className="text-fg-muted">Правильный ответ: </span>
                      {question?.type === "order"
                        ? item.correctAnswer.join(" → ")
                        : item.correctAnswer.join("; ")}
                    </p>
                  ) : null}
                  <p className="text-fg-muted">{item.explanation}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    {lesson ? (
                      <a
                        href={lesson.href}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Повторить урок: {lesson.title}
                      </a>
                    ) : null}
                    {renderQuestionExtra?.(item.questionId)}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
