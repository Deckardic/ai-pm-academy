"use client";

import { useId, useMemo, useState } from "react";
import { Check, ChevronDown, ShieldCheck } from "lucide-react";
import { fillPrompt, promptCategories, type Prompt } from "@/entities/prompt";
import { cn } from "@/shared/lib";
import { Badge, CopyButton, Input, Label, Textarea } from "@/shared/ui";

type PromptCardProps = {
  prompt: Prompt;
  /** Compact mode inside lessons: variables collapsed by default. */
  compact?: boolean;
  className?: string;
};

export function PromptCard({ prompt, compact = false, className }: PromptCardProps) {
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState(!compact);
  const labels = useMemo(
    () => Object.fromEntries(prompt.variables.map((variable) => [variable.name, variable.label])),
    [prompt.variables],
  );
  const filled = fillPrompt(prompt.body, values, labels);

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("not-prose overflow-hidden surface-card", className)}
      data-plain
    >
      <header className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="accent" size="sm">
              Промпт · {promptCategories[prompt.category]}
            </Badge>
            {prompt.worksInRussianModels ? (
              <Badge tone="success" size="sm">
                <ShieldCheck aria-hidden /> Работает в российских моделях
              </Badge>
            ) : null}
          </div>
          <h3 id={`${id}-title`} className="text-base leading-snug font-semibold tracking-tight">
            {prompt.title}
          </h3>
          <p className="text-sm leading-relaxed text-fg-muted">{prompt.summary}</p>
        </div>
        <CopyButton text={filled} variant="primary" className="self-start" />
      </header>

      {prompt.variables.length > 0 ? (
        <div className="px-5 pt-4">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`${id}-vars`}
            onClick={() => setExpanded((value) => !value)}
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg"
          >
            <ChevronDown
              aria-hidden
              className={cn(
                "size-4 transition-transform duration-200 ease-out",
                !expanded && "-rotate-90",
              )}
            />
            Подставить свои данные
          </button>
          {expanded ? (
            <div
              id={`${id}-vars`}
              className="mt-3 grid gap-3 transition-opacity duration-200 ease-out sm:grid-cols-2 starting:opacity-0"
            >
              {prompt.variables.map((variable) => (
                <div
                  key={variable.name}
                  className={cn("flex flex-col gap-1.5", variable.multiline && "sm:col-span-2")}
                >
                  <Label htmlFor={`${id}-${variable.name}`} className="text-[0.8125rem]">
                    {variable.label}
                  </Label>
                  {variable.multiline ? (
                    <Textarea
                      id={`${id}-${variable.name}`}
                      placeholder={variable.placeholder}
                      value={values[variable.name] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, [variable.name]: event.target.value }))
                      }
                      className="min-h-20 text-[0.9375rem]"
                    />
                  ) : (
                    <Input
                      id={`${id}-${variable.name}`}
                      placeholder={variable.placeholder}
                      value={values[variable.name] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, [variable.name]: event.target.value }))
                      }
                      className="h-10 text-[0.9375rem]"
                    />
                  )}
                </div>
              ))}
              <p className="text-xs text-fg-subtle sm:col-span-2">
                Не вставляйте персональные данные и коммерческую тайну — опишите ситуацию
                обезличенно.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="relative mx-5 mt-4 max-h-72 overflow-auto rounded-lg bg-surface-sunken shadow-[inset_0_0_0_1px_var(--line)]">
        <pre className="p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-fg">
          {filled}
        </pre>
      </div>

      <details className="group mt-4 border-t border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-medium text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg [&::-webkit-details-marker]:hidden">
          Почему это работает и что проверить
          <ChevronDown
            aria-hidden
            className="size-4 transition-transform duration-200 ease-out group-open:rotate-180"
          />
        </summary>
        <div className="grid gap-4 px-5 pb-5 text-sm leading-relaxed text-fg-muted sm:grid-cols-2">
          <p>{prompt.whyItWorks}</p>
          <ul className="flex flex-col gap-2">
            {prompt.verify.map((item) => (
              <li key={item} className="flex gap-2">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}
