export const promptCategories = {
  initiation: "Инициация",
  planning: "Планирование",
  risks: "Риски",
  communication: "Коммуникации",
  team: "Команда",
  reporting: "Отчётность",
  requirements: "Требования",
  closing: "Закрытие",
} as const;

export type PromptCategory = keyof typeof promptCategories;
