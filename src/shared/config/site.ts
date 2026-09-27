export const siteConfig = {
  name: "AI PM Academy",
  shortName: "AI PM",
  description:
    "Бесплатный курс для проект-менеджеров: от нуля до Middle. Классическое управление проектами и современная работа с ИИ — на практике.",
  locale: "ru_RU",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? null,
  themeColor: { light: "#fcfcfd", dark: "#131418" },
} as const;

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
