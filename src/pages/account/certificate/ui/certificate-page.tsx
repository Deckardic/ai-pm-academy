import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { getLevel } from "@/entities/course/index.server";
import { CertificateCard } from "@/entities/certificate";
import { getCertificateByCode } from "@/entities/certificate/index.server";
import { getCurrentUser } from "@/entities/user/index.server";
import { ShareCertificate } from "@/features/share-certificate";
import { absoluteUrl, routes } from "@/shared/config";
import { Container, PageSkeleton } from "@/shared/ui";

type Params = { code: string };

export const certificateMetadata: Metadata = {
  title: "Проверка сертификата",
  // The page carries a person's name: shareable by link, but never indexed.
  robots: { index: false, follow: false },
};

export function CertificatePage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function OwnerTools({ userId, url, title }: { userId: string; url: string; title: string }) {
  const user = await getCurrentUser();
  if (user?.id !== userId) return null;
  return <ShareCertificate url={url} title={title} />;
}

async function Content({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const certificate = await getCertificateByCode(decodeURIComponent(code));
  if (!certificate) notFound();
  const level = getLevel(certificate.levelSlug);
  if (!level) notFound();
  const url = absoluteUrl(routes.certificate(certificate.code));
  const revoked = Boolean(certificate.revokedAt);

  return (
    <Container className="flex flex-col gap-8 py-12 lg:py-16">
      <div
        className={
          revoked
            ? "flex items-center gap-3 rounded-xl bg-danger-soft px-5 py-4 text-danger print:hidden"
            : "flex items-center gap-3 rounded-xl bg-success-soft px-5 py-4 text-success print:hidden"
        }
      >
        {revoked ? (
          <ShieldAlert aria-hidden className="size-5" />
        ) : (
          <BadgeCheck aria-hidden className="size-5" />
        )}
        <p className="text-[0.9375rem] font-medium">
          {revoked
            ? "Сертификат отозван и недействителен"
            : "Сертификат действителен и выдан AI PM Academy"}
        </p>
      </div>
      <CertificateCard
        fullName={certificate.fullName}
        fullNameLatin={certificate.fullNameLatin}
        levelTitle={level.title}
        levelTagline={level.tagline}
        levelId={level.id}
        issuedAt={certificate.issuedAt}
        code={certificate.code}
        verifyUrl={url}
        revoked={revoked}
      />
      <Suspense fallback={null}>
        <OwnerTools
          userId={certificate.userId}
          url={url}
          title={`Сертификат AI PM Academy — уровень ${level.title}`}
        />
      </Suspense>
    </Container>
  );
}
