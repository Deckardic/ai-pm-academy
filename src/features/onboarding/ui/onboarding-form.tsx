"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { routes } from "@/shared/config";
import { FieldError, Input, Label, LoadingButton } from "@/shared/ui";
import { saveOnboarding } from "../api/actions";

type Choice<T extends string> = { value: T; label: string; hint?: string };

function ChoiceGroup<T extends string>({
  name,
  legend,
  choices,
  value,
  onChange,
}: {
  name: string;
  legend: ReactNode;
  choices: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="flex pressable cursor-pointer flex-col gap-0.5 rounded-xl bg-surface px-4 py-3 shadow-[inset_0_0_0_1px_var(--line-strong)] hover:bg-bg-subtle has-checked:bg-accent-soft has-checked:shadow-[inset_0_0_0_1.5px_var(--accent)] has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
              className="sr-only"
            />
            <span className="text-[0.9375rem] font-medium">{choice.label}</span>
            {choice.hint ? <span className="text-sm text-fg-muted">{choice.hint}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OnboardingForm({ name }: { name: string }) {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState<"none" | "lt1" | "1to4" | "5plus" | null>(null);
  const [goal, setGoal] = useState<"enter" | "systematize" | "ai" | "promotion" | null>(null);
  const [aiRestricted, setAiRestricted] = useState<"yes" | "no" | "unknown" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!experience || !goal || !aiRestricted)
      return setError("Ответьте, пожалуйста, на все вопросы");
    startTransition(async () => {
      const result = await saveOnboarding({ role, experience, goal, aiRestricted });
      if (!result.ok) return setError(result.error);
      router.push(routes.level(result.recommendedLevel));
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
          {name ? `${name}, давайте познакомимся` : "Давайте познакомимся"}
        </h1>
        <p className="mt-3 text-lg text-fg-muted">
          Четыре вопроса — и мы подскажем, с какого уровня начать.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="onboarding-role">Чем вы занимаетесь сейчас?</Label>
        <Input
          id="onboarding-role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="Например: аналитик, координатор, студент"
        />
      </div>
      <ChoiceGroup
        name="experience"
        legend="Опыт в управлении проектами"
        value={experience}
        onChange={setExperience}
        choices={[
          { value: "none", label: "Нет опыта", hint: "Только присматриваюсь к профессии" },
          { value: "lt1", label: "До года", hint: "Веду первые проекты" },
          { value: "1to4", label: "1–4 года", hint: "Веду несколько проектов" },
          { value: "5plus", label: "5 лет и больше", hint: "Руковожу программами или PMO" },
        ]}
      />
      <ChoiceGroup
        name="goal"
        legend="Главная цель"
        value={goal}
        onChange={setGoal}
        choices={[
          { value: "enter", label: "Войти в профессию" },
          { value: "systematize", label: "Систематизировать знания" },
          { value: "ai", label: "Внедрить ИИ в работу" },
          { value: "promotion", label: "Подготовиться к росту" },
        ]}
      />
      <ChoiceGroup
        name="ai"
        legend="В вашей компании есть ограничения на зарубежные ИИ-сервисы?"
        value={aiRestricted}
        onChange={setAiRestricted}
        choices={[
          {
            value: "yes",
            label: "Да, есть",
            hint: "Покажем приёмы для российских и локальных моделей",
          },
          { value: "no", label: "Нет" },
          { value: "unknown", label: "Не знаю" },
        ]}
      />
      <div className="flex flex-col items-start gap-3">
        <LoadingButton size="lg" pending={pending} onClick={submit}>
          Подобрать уровень <ArrowRight aria-hidden />
        </LoadingButton>
        <FieldError message={error} />
      </div>
    </div>
  );
}
