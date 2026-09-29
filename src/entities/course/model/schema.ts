import { z } from "zod";
import { typo } from "@/shared/content/index.server";

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug: только латиница в нижнем регистре, цифры и дефисы");

/** Display text: trimmed and run through the Russian typograf at build time. */
export const textSchema = z.string().trim().min(1).transform(typo);

export const levelIdSchema = z.enum(["junior", "middle", "senior"]);
export type LevelId = z.infer<typeof levelIdSchema>;

export const levelSchema = z.object({
  id: levelIdSchema,
  slug: slugSchema,
  order: z.number().int().min(1),
  title: z.string().min(1),
  tagline: textSchema,
  description: textSchema,
  audience: textSchema,
  outcomes: z.array(textSchema).min(1),
  status: z.enum(["published", "soon"]),
});

export const moduleSchema = z.object({
  id: z.string().regex(/^[jms]\d{2}$/, "id модуля: j01, m07, s03…"),
  slug: slugSchema,
  order: z.number().int().min(1),
  title: textSchema,
  summary: textSchema,
  goals: z.array(textSchema).min(1),
  artifact: textSchema.optional(),
  status: z.enum(["published", "planned"]),
  /** Spec fields for the generation pipeline (scripts/content). */
  keyConcepts: z.array(z.string()).default([]),
  searchQueries: z.array(z.string()).default([]),
  /** Detailed lesson plan: the program of the module and the input for generation. */
  lessonsPlan: z
    .array(
      z.object({
        slug: slugSchema,
        title: textSchema,
        focus: z.string(),
        durationMin: z.number().int().min(5).max(30).default(12),
        keyPoints: z.array(z.string()).min(3),
        aiAngle: z.string().optional(),
        practice: z.string().optional(),
      }),
    )
    .default([]),
  /** Practical assignment spec (generated into assignment.mdx). */
  assignment: z.object({ title: textSchema, deliverable: textSchema, brief: z.string() }).optional(),
  /** What the module test must cover. */
  quizFocus: z.array(z.string()).default([]),
  generation: z
    .object({ model: z.string(), promptVersion: z.string(), generatedAt: z.string() })
    .optional(),
});

export const lessonFrontmatterSchema = z.object({
  id: z.string().regex(/^[jms]\d{2}-\d{2}$/, "id урока: j01-01"),
  slug: slugSchema,
  title: textSchema,
  /** First-screen answer in 2–3 sentences: used as meta description and by AI assistants. */
  description: textSchema,
  durationMin: z.number().int().min(3).max(60),
  revisedAt: z.iso.date(),
  aiTopic: z.boolean().default(false),
  draft: z.boolean().default(false),
  version: z.number().int().min(1).default(1),
  goals: z.array(textSchema).min(1).max(5),
  keywords: z.array(z.string()).default([]),
  sources: z.array(z.object({ title: z.string(), url: z.url() })).default([]),
});

export const assignmentFrontmatterSchema = z.object({
  id: z.string().regex(/^[jms]\d{2}-pr$/, "id задания: j01-pr"),
  title: textSchema,
  durationMin: z.number().int().min(10).max(240),
  deliverable: textSchema,
  checklist: z.array(textSchema).min(2),
});
