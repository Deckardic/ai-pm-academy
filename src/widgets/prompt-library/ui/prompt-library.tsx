"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { promptCategories, type Prompt, type PromptCategory } from "@/entities/prompt";
import { PromptCard } from "@/features/copy-prompt";
import { cn } from "@/shared/lib";

const chip =
  "pressable inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-bg-subtle aria-pressed:bg-fg aria-pressed:text-bg aria-pressed:shadow-none";

/** Filtering is frequent, so the list updates instantly — no enter animations. */
export function PromptLibrary({ prompts }: { prompts: Prompt[] }) {
  const [category, setCategory] = useState<PromptCategory | "all">("all");
  const [russianOnly, setRussianOnly] = useState(false);
  const categories = useMemo(
    () =>
      (Object.keys(promptCategories) as PromptCategory[]).filter((key) =>
        prompts.some((prompt) => prompt.category === key),
      ),
    [prompts],
  );
  const visible = prompts.filter(
    (prompt) =>
      (category === "all" || prompt.category === category) &&
      (!russianOnly || prompt.worksInRussianModels),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Фильтр промптов">
        <button
          type="button"
          aria-pressed={category === "all"}
          className={chip}
          onClick={() => setCategory("all")}
        >
          Все
        </button>
        {categories.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={category === key}
            className={chip}
            onClick={() => setCategory(key)}
          >
            {promptCategories[key]}
          </button>
        ))}
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <button
          type="button"
          aria-pressed={russianOnly}
          className={chip}
          onClick={() => setRussianOnly((value) => !value)}
        >
          <ShieldCheck aria-hidden className="size-3.5" /> Российские модели
        </button>
      </div>
      <p className="text-sm text-fg-muted" aria-live="polite">
        Найдено: {visible.length}
      </p>
      <div className={cn("grid gap-5 lg:grid-cols-2")}>
        {visible.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} compact />
        ))}
      </div>
    </div>
  );
}
