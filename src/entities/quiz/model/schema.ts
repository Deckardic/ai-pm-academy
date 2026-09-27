import { z } from "zod";
import { typo } from "@/shared/content/index.server";

const text = z.string().trim().min(1).transform(typo);
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const optionSchema = z.object({ id, text });

const baseQuestion = {
  id,
  /** Situational questions describe a case before the prompt. */
  scenario: text.optional(),
  prompt: text,
  explanation: text,
  lessonId: z.string().optional(),
  /** Placement test only: which level the question probes. */
  level: z.enum(["junior", "middle", "senior"]).optional(),
  area: z.enum(["pm", "ai"]).optional(),
};

export const questionSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseQuestion,
    type: z.literal("single"),
    options: z.array(optionSchema).min(2).max(6),
    correct: id,
  }),
  z.object({
    ...baseQuestion,
    type: z.literal("multiple"),
    options: z.array(optionSchema).min(3).max(7),
    correct: z.array(id).min(2),
  }),
  z.object({
    ...baseQuestion,
    type: z.literal("order"),
    /** Listed in the correct order; shuffled before being sent to the client. */
    items: z.array(optionSchema).min(3).max(6),
  }),
]);

export const quizSchema = z
  .object({
    id,
    kind: z.enum(["module", "exam", "placement"]),
    title: text,
    passScore: z.number().min(0.5).max(1).default(0.7),
    questionsPerAttempt: z.number().int().min(1),
    timeLimitMin: z.number().int().min(5).optional(),
    cooldownHours: z.number().int().min(1).optional(),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((quiz, ctx) => {
    const ids = new Set<string>();
    quiz.questions.forEach((question, index) => {
      if (ids.has(question.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "id"],
          message: "повторяющийся id вопроса",
        });
      }
      ids.add(question.id);
      if (question.type === "single" || question.type === "multiple") {
        const optionIds = new Set(question.options.map((option) => option.id));
        const correct = question.type === "single" ? [question.correct] : question.correct;
        for (const answer of correct) {
          if (!optionIds.has(answer)) {
            ctx.addIssue({
              code: "custom",
              path: ["questions", index, "correct"],
              message: `нет варианта «${answer}»`,
            });
          }
        }
      }
    });
    if (quiz.questions.length < quiz.questionsPerAttempt) {
      ctx.addIssue({
        code: "custom",
        path: ["questionsPerAttempt"],
        message: "в пуле меньше вопросов, чем в попытке",
      });
    }
    if (quiz.kind === "exam" && quiz.questions.length < quiz.questionsPerAttempt * 3) {
      ctx.addIssue({
        code: "custom",
        path: ["questions"],
        message: "пул итогового экзамена должен быть не меньше 3× от числа вопросов в попытке",
      });
    }
  });

export type Question = z.output<typeof questionSchema>;
export type Quiz = z.output<typeof quizSchema>;
