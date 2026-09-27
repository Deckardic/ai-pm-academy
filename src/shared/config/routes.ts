import type { Route } from "next";

/**
 * Single source of truth for URLs. Slugs are transliterated Russian.
 */
export const routes = {
  home: () => "/" as Route,
  catalog: () => "/kurs" as Route,
  level: (level: string) => `/${level}` as Route,
  module: (level: string, module: string) => `/${level}/${module}` as Route,
  lesson: (level: string, module: string, lesson: string) =>
    `/${level}/${module}/${lesson}` as Route,
  moduleQuiz: (level: string, module: string) => `/${level}/${module}/test` as Route,
  moduleAssignment: (level: string, module: string) => `/${level}/${module}/praktika` as Route,
  levelExam: (level: string) => `/${level}/ekzamen` as Route,
  prompts: () => "/biblioteka/prompty" as Route,
  templates: () => "/biblioteka/shablony" as Route,
  template: (slug: string) => `/biblioteka/shablony/${slug}` as Route,
  templateDownload: (slug: string) => `/biblioteka/shablony/${slug}/skachat` as Route,
  glossary: () => "/glossariy" as Route,
  glossaryTerm: (slug: string) => `/glossariy/${slug}` as Route,
  placementTest: () => "/test-urovnya" as Route,
  signIn: (next?: string) => (next ? `/vhod?next=${encodeURIComponent(next)}` : "/vhod") as Route,
  signUp: () => "/vhod?mode=sign-up" as Route,
  resetPassword: () => "/vhod/novyy-parol" as Route,
  dashboard: () => "/kabinet" as Route,
  onboarding: () => "/kabinet/znakomstvo" as Route,
  certificate: (code: string) => `/sertifikat/${code}` as Route,
  about: () => "/o-proekte" as Route,
  privacy: () => "/politika-konfidencialnosti" as Route,
  consent: () => "/soglasie" as Route,
  terms: () => "/soglashenie" as Route,
  cookies: () => "/cookies" as Route,
} as const;
