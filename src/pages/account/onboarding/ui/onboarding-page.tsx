import { Suspense } from "react";
import type { Metadata } from "next";
import { firstName } from "@/entities/user";
import { requireUser } from "@/entities/user/index.server";
import { OnboardingForm } from "@/features/onboarding";
import { routes } from "@/shared/config";
import { Container, PageSkeleton } from "@/shared/ui";

export const onboardingMetadata: Metadata = { title: "Знакомство", robots: { index: false } };

async function Content() {
  const user = await requireUser(routes.onboarding());
  return <OnboardingForm name={firstName(user.name)} />;
}

export function OnboardingPage() {
  return (
    <Container size="narrow" className="py-14 lg:py-20">
      <Suspense fallback={<PageSkeleton size="narrow" />}>
        <Content />
      </Suspense>
    </Container>
  );
}
