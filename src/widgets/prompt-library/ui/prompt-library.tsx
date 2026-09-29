"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { promptCategories, type Prompt, type PromptCategory } from "@/entities/prompt";
import { PromptCard } from "@/features/copy-prompt";
import { cn } from "@/shared/lib";
import { Input } from "@/shared/ui";

const chip =
  "pressable inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-bg-subtle aria-pressed:bg-fg aria-pressed:text-bg aria-pressed:shadow-none";

const PAGE_SIZE = 24;

/** Filtering is frequent, so the list updates instantly — no enter animations. */
export function PromptLibrary({ prompts }: { prompts: Prompt[] }) {
  const [category, setCategory] = useState<PromptCategory | "all">("all");
  const [russianOnly, setRussianOnly] = useState(false);
  const [level, setLevel] = useState<Prompt["level"] | "all">("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const categories = useMemo(
    () =>
      (Object.keys(promptCategories) as PromptCategory[]).filter((key) =>
        prompts.some((prompt) => prompt.category === key),
      ),
    [prompts],
  );
  const needle = query.trim().toLowerCase();
  const visible = prompts.filter(
    (prompt) =>
      (category === "all" || prompt.category === category) &&
      (level === "all" || prompt.level === level) &&
      (!russianOnly || prompt.worksInRussianModels) &&
      (needle === "" || `${prompt.title} ${prompt.summary}`.toLowerCase().includes(needle)),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-md">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти промпт: статус, риски, протокол…"
          aria-label="Поиск по промптам"
          className="pl-10"
        />
      </div>
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
        {(["junior", "middle"] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={level === key}
            className={chip}
            onClick={() => setLevel((value) => (value === key ? "all" : key))}
          >
            {key === "junior" ? "Junior" : "Middle"}
          </button>
        ))}
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
      <h2 className="sr-only">Промпты</h2>
      <div className={cn("grid gap-5 lg:grid-cols-2")}>
        {visible.slice(0, limit).map((prompt) => (
          <div key={prompt.id} id={prompt.id} className="scroll-mt-24">
            <PromptCard prompt={prompt} compact />
          </div>
        ))}
      </div>
      {visible.length > limit ? (
        <button
          type="button"
          className={cn(chip, "self-center")}
          onClick={() => setLimit((value) => value + PAGE_SIZE)}
        >
          Показать ещё ({visible.length - limit})
        </button>
      ) : null}
    </div>
  );
}
