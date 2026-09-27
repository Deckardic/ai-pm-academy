"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import {
  getContentVersion,
  getLevel,
  getModule,
  getModuleById,
  getModules,
} from "@/entities/course/index.server";
import { issueCertificate } from "@/entities/certificate/index.server";
import {
  completeAttempt,
  createAttempt,
  getAttempt,
  getLastSubmittedAttempt,
  getPassedQuizIds,
} from "@/entities/progress/index.server";
import {
  getLevelExam,
  getModuleQuiz,
  grade,
  pickQuestions,
  toPublicQuestion,
  type Answers,
  type GradeResult,
  type PublicQuestion,
  type Quiz,
} from "@/entities/quiz/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { absoluteUrl, routes } from "@/shared/config";
import { mailTemplates, sendMail } from "@/shared/mail/index.server";

const GRACE_MS = 60_000;

const startSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("module"),
    levelSlug: z.string().max(40),
    moduleSlug: z.string().max(80),
  }),
  z.object({ kind: z.literal("exam"), levelSlug: z.string().max(40) }),
]);

export type StartQuizResult =
  | { ok: true; attemptId: string; questions: PublicQuestion[]; deadline: string | null }
  | { ok: false; error: string };

export type ExamExtra = { certificateCode: string | null };
export type SubmitQuizResult =
  { ok: true; result: GradeResult; extra?: ExamExtra } | { ok: false; error: string };

const formatWhen = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Moscow",
});

function examQuizIds(levelSlug: string) {
  return getModules(levelSlug)
    .filter((mod) => mod.hasQuiz)
    .map((mod) => `${mod.id}-quiz`);
}

export async function startQuiz(input: z.input<typeof startSchema>): Promise<StartQuizResult> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Некорректный запрос" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Войдите, чтобы проходить тесты" };
  const data = parsed.data;

  const level = getLevel(data.levelSlug);
  if (!level || level.status !== "published") return { ok: false, error: "Уровень не найден" };

  let quiz: Quiz | null = null;
  let moduleId: string | null = null;

  if (data.kind === "module") {
    const mod = getModule(data.levelSlug, data.moduleSlug);
    quiz = mod ? getModuleQuiz(mod.dir) : null;
    moduleId = mod?.id ?? null;
  } else {
    quiz = getLevelExam(level.dir);
    if (quiz) {
      const passed = await getPassedQuizIds(user.id);
      const required = examQuizIds(level.slug);
      if (!required.every((id) => passed.has(id))) {
        return { ok: false, error: "Экзамен откроется после тестов всех модулей уровня" };
      }
      if (passed.has(quiz.id))
        return { ok: false, error: "Экзамен уже сдан — сертификат в личном кабинете" };
      const last = await getLastSubmittedAttempt(user.id, quiz.id);
      if (last?.submittedAt && quiz.cooldownHours) {
        const retryAt = last.submittedAt.getTime() + quiz.cooldownHours * 3_600_000;
        if (retryAt > Date.now()) {
          return {
            ok: false,
            error: `Следующая попытка — ${formatWhen.format(new Date(retryAt))} (МСК)`,
          };
        }
      }
    }
  }
  if (!quiz) return { ok: false, error: "Тест не найден" };

  const questions = pickQuestions(quiz);
  const attempt = await createAttempt({
    userId: user.id,
    quizId: quiz.id,
    kind: data.kind,
    levelSlug: level.slug,
    moduleId,
    contentVersion: getContentVersion(),
    questionIds: questions.map((question) => question.id),
  });
  const deadline = quiz.timeLimitMin
    ? new Date(attempt.startedAt.getTime() + quiz.timeLimitMin * 60_000).toISOString()
    : null;
  return {
    ok: true,
    attemptId: attempt.id,
    questions: questions.map((question) => toPublicQuestion(question)),
    deadline,
  };
}

const answerSchema = z.union([z.string().max(64), z.array(z.string().max(64)).max(10)]);
const submitSchema = z.object({
  attemptId: z.string().min(1).max(64),
  answers: z.record(z.string().max(64), answerSchema),
});

export async function submitQuiz(input: z.input<typeof submitSchema>): Promise<SubmitQuizResult> {
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Некорректные ответы" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Сессия истекла — войдите снова" };

  const attempt = await getAttempt(parsed.data.attemptId, user.id);
  if (!attempt) return { ok: false, error: "Попытка не найдена" };
  if (attempt.submittedAt) return { ok: false, error: "Эта попытка уже завершена" };

  const level = getLevel(attempt.levelSlug);
  const quiz =
    attempt.kind === "exam"
      ? level
        ? getLevelExam(level.dir)
        : null
      : (() => {
          const mod = attempt.moduleId ? getModuleById(attempt.moduleId) : null;
          return mod ? getModuleQuiz(mod.dir) : null;
        })();
  if (!level || !quiz) return { ok: false, error: "Тест не найден" };

  const answers: Answers = parsed.data.answers;
  let result = grade(quiz, attempt.questionIds, answers);
  if (quiz.timeLimitMin) {
    const limit = attempt.startedAt.getTime() + quiz.timeLimitMin * 60_000 + GRACE_MS;
    if (Date.now() > limit) result = { ...result, passed: false };
  }

  const saved = await completeAttempt(attempt.id, user.id, {
    answers,
    score: result.score,
    passed: result.passed,
  });
  if (!saved) return { ok: false, error: "Эта попытка уже завершена" };

  let certificateCode: string | null = null;
  if (attempt.kind === "exam" && result.passed) {
    const certificate = await issueCertificate({
      userId: user.id,
      levelSlug: level.slug,
      fullName: user.name,
      fullNameLatin: (user as { nameLatin?: string | null }).nameLatin ?? null,
      contentVersion: getContentVersion(),
    });
    certificateCode = certificate.code;
    await sendMail({
      to: user.email,
      ...mailTemplates.certificateIssued(
        absoluteUrl(routes.certificate(certificate.code)),
        level.title,
      ),
    }).catch((cause) => console.error("certificate email failed", cause));
  }

  refresh();
  return { ok: true, result, extra: attempt.kind === "exam" ? { certificateCode } : undefined };
}
