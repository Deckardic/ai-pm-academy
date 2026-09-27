import { z } from "zod";
import { typo } from "@/shared/content/index.server";

const text = z.string().trim().min(1).transform(typo);

export const glossaryTermSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  term: text,
  /** English equivalent — the profession is full of anglicisms. */
  en: z.string().optional(),
  short: text,
  definition: text,
  related: z.array(z.string()).default([]),
  lessonIds: z.array(z.string()).default([]),
});

export const glossarySchema = z.object({ terms: z.array(glossaryTermSchema).min(1) });

export type GlossaryTerm = z.output<typeof glossaryTermSchema>;
