import type { ReactNode } from "react";
import { getTerm } from "@/entities/glossary/index.server";
import { getPrompt } from "@/entities/prompt/index.server";
import { getTemplate } from "@/entities/template/index.server";
import { PromptCard } from "@/features/copy-prompt";
import { renderMdx, type MdxComponents } from "@/shared/content/index.server";
import type { lessonComponentNames } from "../model/component-names";
import { After, Before, BeforeAfter } from "./before-after";
import { Callout } from "./callout";
import { InlineQuiz } from "./inline-quiz";
import { KeyTakeaways } from "./key-takeaways";
import { Steps } from "./steps";
import { Term } from "./term";
import { TemplateLink } from "./template-link";

const components = {
  Callout,
  BeforeAfter,
  Before,
  After,
  InlineQuiz,
  KeyTakeaways,
  Steps,
  PromptCard: ({ id }: { id: string }) => {
    const prompt = getPrompt(id);
    return prompt ? <PromptCard prompt={prompt} compact /> : null;
  },
  Term: ({ id, children }: { id: string; children: ReactNode }) => (
    <Term term={getTerm(id)}>{children}</Term>
  ),
  TemplateLink: ({ slug }: { slug: string }) => <TemplateLink template={getTemplate(slug)} />,
} satisfies Record<(typeof lessonComponentNames)[number], MdxComponents[string]>;

export async function LessonBody({ source }: { source: string }) {
  return <div className="prose-lesson">{await renderMdx(source, components)}</div>;
}
