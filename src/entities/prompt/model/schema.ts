import { z } from "zod";
import { typo } from "@/shared/content/index.server";
import { promptCategories, type PromptCategory } from "./categories";

const text = z.string().trim().min(1).transform(typo);

export type { PromptCategory };

export const promptSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: text,
  summary: text,
  category: z.enum(Object.keys(promptCategories) as [PromptCategory, ...PromptCategory[]]),
  level: z.enum(["junior", "middle", "senior"]),
  /** Copied verbatim into an AI assistant, so no typograf here. {{variables}} are filled in on the page. */
  body: z.string().trim().min(20),
  variables: z
    .array(
      z.object({
        name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
        label: z.string(),
        placeholder: z.string().default(""),
        multiline: z.boolean().default(false),
      }),
    )
    .default([]),
  whyItWorks: text,
  verify: z.array(text).min(1),
  worksInRussianModels: z.boolean().default(true),
  lessonIds: z.array(z.string()).default([]),
});

export type Prompt = z.output<typeof promptSchema>;
