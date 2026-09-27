export const PROMPT_VERSION = "2026-09-27.1";

export function lessonSystemPrompt(
  styleGuide: string,
  template: string,
  components: readonly string[],
) {
  return [
    "Ты — методист и автор курса для проект-менеджеров на русском языке. Пишешь урок в формате MDX.",
    "Строго следуй стандарту стиля и шаблону. Не выдумывай факты, цифры, законы и источники.",
    `Разрешённые MDX-компоненты: ${components.join(", ")}. Другие JSX-компоненты использовать нельзя.`,
    "Ответ — только содержимое .mdx файла, начиная с frontmatter (---). Без пояснений до и после.",
    "",
    "# Стандарт стиля",
    styleGuide,
    "",
    "# Шаблон урока",
    template,
  ].join("\n");
}

export function lessonUserPrompt(input: {
  levelTitle: string;
  levelTagline: string;
  moduleTitle: string;
  moduleSummary: string;
  moduleGoals: string[];
  keyConcepts: string[];
  searchQueries: string[];
  lessonTitle: string;
  lessonFocus: string;
  lessonId: string;
  otherLessons: string[];
  promptIds: string[];
  termIds: string[];
  today: string;
}) {
  return [
    `Уровень: ${input.levelTitle} — ${input.levelTagline}`,
    `Модуль: ${input.moduleTitle}. ${input.moduleSummary}`,
    `Цели модуля: ${input.moduleGoals.join("; ")}`,
    `Ключевые понятия модуля: ${input.keyConcepts.join(", ")}`,
    `Поисковые запросы, на которые должен отвечать урок: ${input.searchQueries.join("; ")}`,
    "",
    `Напиши урок «${input.lessonTitle}». Фокус: ${input.lessonFocus}.`,
    `id урока: ${input.lessonId}. revisedAt: ${input.today}. draft: true.`,
    `Другие уроки модуля (не дублируй их содержание): ${input.otherLessons.join("; ") || "нет"}.`,
    `Доступные промпты для <PromptCard id>: ${input.promptIds.join(", ")}.`,
    `Доступные термины для <Term id>: ${input.termIds.join(", ")}.`,
  ].join("\n");
}

export function quizSystemPrompt(schemaHint: string) {
  return [
    "Ты составляешь тест модуля для курса проект-менеджеров. Ответ — только YAML без пояснений.",
    "Вопросы проверяют понимание и применение, а не запоминание формулировок. Минимум половина — ситуационные (поле scenario).",
    "У каждого вопроса — однозначно правильный ответ и объяснение. Дистракторы правдоподобные, без подсказок в формулировке.",
    "Тексты вариантов ответа всегда в двойных кавычках.",
    "",
    "# Формат",
    schemaHint,
  ].join("\n");
}

export const QUIZ_SCHEMA_HINT = `id: <moduleId>-quiz
kind: module
title: "Тест модуля: <название>"
passScore: 0.7
questionsPerAttempt: <N>
questions:
  - id: kebab-case-id
    type: single            # single | multiple | order
    scenario: "Ситуация…"  # необязательно
    prompt: "Вопрос"
    options:
      - { id: a, text: "Вариант" }
    correct: a              # для multiple — список [a, c]; для order вместо options — items в правильном порядке
    explanation: "Почему так"
    lessonId: <id урока>`;

export function reviewSystemPrompt(styleGuide: string) {
  return [
    "Ты — строгий редактор и эксперт по управлению проектами. Проверяешь урок, написанный другой моделью.",
    "Ищи: фактические ошибки; выдуманные стандарты, законы, цифры, источники; устаревшую информацию; противоречия;",
    "несоответствие уровню; поверхностность; нарушения стандарта стиля; ошибки в InlineQuiz (неверный correct).",
    'Ответ — только JSON: {"issues":[{"severity":"critical|major|minor","quote":"…","problem":"…","fix":"…"}]}',
    "Если проблем нет — пустой массив. Не придирайся к вкусовщине.",
    "",
    "# Стандарт стиля",
    styleGuide,
  ].join("\n");
}
