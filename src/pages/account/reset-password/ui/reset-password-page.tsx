import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/authentication";
import { Container, Skeleton } from "@/shared/ui";

export const resetPasswordMetadata: Metadata = { title: "Новый пароль", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Form({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : null} />;
}

export function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Container size="narrow" className="flex flex-1 flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Новый пароль</h1>
        <p className="mt-2 text-fg-muted">Придумайте пароль не короче 8 символов.</p>
        <div className="mt-8">
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
            <Form searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
