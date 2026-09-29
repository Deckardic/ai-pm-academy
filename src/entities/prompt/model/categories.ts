export const promptCategories = {
  initiation: "Инициация",
  planning: "Планирование",
  estimation: "Оценка и сроки",
  risks: "Риски",
  requirements: "Требования",
  process: "Процесс",
  communication: "Коммуникации",
  stakeholders: "Стейкхолдеры",
  team: "Команда",
  reporting: "Отчётность",
  budget: "Бюджет",
  ai: "ИИ-воркфлоу",
  closing: "Закрытие",
  career: "Карьера",
} as const;

export type PromptCategory = keyof typeof promptCategories;
