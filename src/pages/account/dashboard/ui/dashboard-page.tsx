import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Award, CheckCircle2, Download, XCircle } from "lucide-react";
import { getLevels, getModuleById, getModules } from "@/entities/course/index.server";
import { getUserCertificates } from "@/entities/certificate/index.server";
import { getSubmittedAttempts } from "@/entities/progress/index.server";
import { firstName } from "@/entities/user";
import { getUserProfile, requireUser } from "@/entities/user/index.server";
import { DeleteAccount } from "@/features/delete-account";
import { ProfileForm } from "@/features/update-profile";
import { routes } from "@/shared/config";
import { formatDate, formatShortDate } from "@/shared/lib";
import { Badge, ButtonLink, Container, PageSkeleton } from "@/shared/ui";
import { LevelProgressCard } from "@/widgets/level-progress";

export const dashboardMetadata: Metadata = { title: "Личный кабинет", robots: { index: false } };

export function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}

function quizTitle(quizId: string, levelSlug: string) {
  if (quizId.endsWith("-exam"))
    return `Итоговый экзамен ${levelSlug === "junior" ? "Junior" : levelSlug === "middle" ? "Middle" : "Senior"}`;
  const mod = getModuleById(quizId.replace(/-quiz$/, ""));
  return mod ? `Тест: ${mod.title}` : quizId;
}

async function Content() {
  const sessionUser = await requireUser(routes.dashboard());
  const [profile, attempts, certificates] = await Promise.all([
    getUserProfile(sessionUser.id),
    getSubmittedAttempts(sessionUser.id),
    getUserCertificates(sessionUser.id),
  ]);
  const levels = getLevels().filter((level) => level.status === "published");
  const recommended = profile?.onboarding?.recommendedLevel;
  const ordered = [...levels].sort(
    (a, b) => Number(b.id === recommended) - Number(a.id === recommended),
  );

  return (
    <Container className="flex flex-col gap-14 py-12 lg:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-fg-muted">Личный кабинет</p>
          <h1 className="mt-1 text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-[-0.035em]">
            Привет{profile?.name ? `, ${firstName(profile.name)}` : ""}!
          </h1>
        </div>
        {!profile?.onboarding ? (
          <ButtonLink href={routes.onboarding()} variant="secondary">
            Подобрать уровень
          </ButtonLink>
        ) : null}
      </header>

      <section aria-labelledby="levels-title" className="flex flex-col gap-4">
        <h2 id="levels-title" className="text-xl font-semibold tracking-tight">
          Уровни
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {ordered.map((level) => (
            <div key={level.id} className="flex flex-col gap-2">
              <Link
                href={routes.level(level.slug)}
                className="text-sm font-medium text-fg-muted hover:text-fg"
              >
                {level.title} · {level.tagline}
                {recommended === level.id ? (
                  <Badge tone="accent" size="sm" className="ml-2">
                    Рекомендуем
                  </Badge>
                ) : null}
              </Link>
              <LevelProgressCard level={level} modules={getModules(level.slug)} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="certs-title" className="flex flex-col gap-4">
          <h2 id="certs-title" className="text-xl font-semibold tracking-tight">
            Сертификаты
          </h2>
          {certificates.length === 0 ? (
            <p className="rounded-xl p-5 text-[0.9375rem] text-fg-muted shadow-[inset_0_0_0_1px_var(--line)]">
              Сертификат выдаётся после тестов всех модулей уровня и итогового экзамена.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {certificates.map((certificate) => (
                <li key={certificate.id}>
                  <Link
                    href={routes.certificate(certificate.code)}
                    className="flex items-center gap-4 surface-card p-4 transition-shadow duration-200 ease-out hover:shadow-card-hover"
                  >
                    <Award aria-hidden className="size-6 text-senior" />
                    <span className="flex-1">
                      <span className="block font-medium">
                        Уровень {certificate.levelSlug === "junior" ? "Junior" : "Middle"}
                      </span>
                      <span className="block text-sm text-fg-muted">
                        {certificate.code} · {formatDate(certificate.issuedAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="attempts-title" className="flex flex-col gap-4">
          <h2 id="attempts-title" className="text-xl font-semibold tracking-tight">
            Результаты тестов
          </h2>
          {attempts.length === 0 ? (
            <p className="rounded-xl p-5 text-[0.9375rem] text-fg-muted shadow-[inset_0_0_0_1px_var(--line)]">
              Здесь появятся результаты тестов модулей и экзаменов.
            </p>
          ) : (
            <ul className="divide-y divide-line surface-card">
              {attempts.slice(0, 8).map((attempt) => (
                <li key={attempt.id} className="flex items-center gap-3 px-4 py-3 text-[0.9375rem]">
                  {attempt.passed ? (
                    <CheckCircle2 aria-label="Пройден" className="size-5 shrink-0 text-success" />
                  ) : (
                    <XCircle aria-label="Не пройден" className="size-5 shrink-0 text-fg-subtle" />
                  )}
                  <span className="flex-1 truncate">
                    {quizTitle(attempt.quizId, attempt.levelSlug)}
                  </span>
                  <span className="text-fg-muted tabular-nums">
                    {Math.round((attempt.score ?? 0) * 100)}%
                  </span>
                  <span className="w-16 text-right text-sm text-fg-subtle">
                    {attempt.submittedAt ? formatShortDate(attempt.submittedAt) : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section
        aria-labelledby="settings-title"
        className="flex flex-col gap-6 border-t border-line pt-12"
      >
        <h2 id="settings-title" className="text-xl font-semibold tracking-tight">
          Профиль и данные
        </h2>
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          {profile ? (
            <ProfileForm
              name={profile.name}
              nameLatin={profile.nameLatin}
              emailReminders={profile.emailReminders}
            />
          ) : null}
          <div className="flex flex-col gap-4 text-[0.9375rem]">
            <p className="text-fg-muted">
              {profile?.email}
              {profile && !profile.emailVerified ? (
                <span className="mt-1 block text-sm text-warning">
                  Почта не подтверждена — проверьте письмо от нас
                </span>
              ) : null}
            </p>
            {/* A file download, not a page: a plain anchor with `download`. */}
            <a
              href="/api/me/export"
              download
              className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
            >
              <Download aria-hidden className="size-4" /> Скачать мои данные (JSON)
            </a>
            <DeleteAccount />
          </div>
        </div>
      </section>
    </Container>
  );
}
