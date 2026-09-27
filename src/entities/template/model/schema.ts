import { z } from "zod";
import { typo } from "@/shared/content/index.server";

const text = z.string().trim().min(1).transform(typo);

export const templateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text,
  summary: text,
  level: z.enum(["junior", "middle", "senior"]),
  /** Markdown body of the template; downloadable as .md, copyable into any editor. */
  body: z.string().trim().min(20),
  howToUse: z.array(text).min(1),
  lessonIds: z.array(z.string()).default([]),
});

export type Template = z.output<typeof templateSchema>;
