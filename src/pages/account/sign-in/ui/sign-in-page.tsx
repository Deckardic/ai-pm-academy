import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Route } from "next";
import { BookOpenCheck, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/entities/user/index.server";
import { SignInForm } from "@/features/authentication";
import { getAuthProviders } from "@/shared/auth/index.server";
import { routes } from "@/shared/config";
import { Container, Skeleton } from "@/shared/ui";

export const signInMetadata: Metadata = {
  title: "Вход и регистрация",
  robots: { index: false, follow: true },
  alternates: { canonical: routes.signIn() },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function FormSection({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // providers come from runtime env, not build time
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : undefined;
  if (await getCurrentUser()) redirect((next ?? routes.dashboard()) as Route);
  return (
    <SignInForm
      providers={getAuthProviders()}
      next={next}
      defaultMode={params.mode === "sign-up" ? "sign-up" : "sign-in"}
    />
  );
}

const perks = [
  { icon: BookOpenCheck, text: "Прогресс сохраняется и синхронизируется между устройствами" },
  { icon: Sparkles, text: "Тесты модулей, итоговый экзамен и сертификат с проверкой" },
  { icon: ShieldCheck, text: "Данные хранятся в России, в соответствии с 152-ФЗ" },
];

export function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Container className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-2 lg:py-20">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Добро пожаловать</h1>
        <p className="mt-2 text-fg-muted">Аккаунт бесплатный и нужен, чтобы сохранять прогресс.</p>
        <div className="mt-8">
          <Suspense fallback={<Skeleton className="h-[26rem] w-full rounded-xl" />}>
            <FormSection searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden rounded-3xl bg-fg p-10 text-bg lg:block">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-72 rounded-full bg-accent/50 blur-3xl"
        />
        <p className="relative text-2xl leading-snug font-semibold tracking-tight">
          От первого урока до сертификата — в своём темпе.
        </p>
        <ul className="relative mt-8 flex flex-col gap-5">
          {perks.map((perk) => (
            <li key={perk.text} className="flex gap-3 text-bg/80">
              <perk.icon aria-hidden className="mt-0.5 size-5 shrink-0 text-bg" />
              {perk.text}
            </li>
          ))}
        </ul>
      </aside>
    </Container>
  );
}
