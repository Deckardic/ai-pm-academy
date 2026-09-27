import { cn, formatDate } from "@/shared/lib";
import { LogoMark } from "@/shared/ui";
import { CERTIFICATE_DISCLAIMER } from "../model/code";

type CertificateCardProps = {
  fullName: string;
  fullNameLatin?: string | null;
  levelTitle: string;
  levelTagline: string;
  levelId: "junior" | "middle" | "senior";
  issuedAt: Date | string;
  code: string;
  verifyUrl: string;
  revoked?: boolean;
  className?: string;
};

const accent = {
  junior: "from-junior/70 via-junior/20",
  middle: "from-middle/70 via-middle/20",
  senior: "from-senior/70 via-senior/20",
} as const;

export function CertificateCard({
  fullName,
  fullNameLatin,
  levelTitle,
  levelTagline,
  levelId,
  issuedAt,
  code,
  verifyUrl,
  revoked,
  className,
}: CertificateCardProps) {
  return (
    <article
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-surface p-8 shadow-card sm:p-12",
        revoked && "opacity-60 grayscale",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b to-transparent opacity-40",
          accent[levelId],
        )}
      />
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-60" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-sm font-semibold tracking-tight">AI PM Academy</span>
        </div>
        <span className="font-mono text-xs tracking-wider text-fg-muted">{code}</span>
      </div>

      <p className="mt-12 text-sm font-medium tracking-[0.12em] text-fg-muted uppercase">
        Сертификат о прохождении онлайн-курса
      </p>
      <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-[-0.03em]">
        {fullName}
      </h2>
      {fullNameLatin ? <p className="mt-1 text-lg text-fg-muted">{fullNameLatin}</p> : null}

      <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-muted">
        успешно прошёл(-ла) уровень <span className="font-semibold text-fg">{levelTitle}</span> — «
        {levelTagline}» — и сдал(-а) итоговый экзамен.
      </p>

      <dl className="mt-10 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-fg-subtle">Дата выдачи</dt>
          <dd className="mt-1 font-medium">{formatDate(issuedAt)}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Номер</dt>
          <dd className="mt-1 font-mono font-medium">{code}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Проверка</dt>
          <dd className="mt-1 truncate font-medium">{verifyUrl.replace(/^https?:\/\//, "")}</dd>
        </div>
      </dl>
      <p className="mt-6 text-xs leading-relaxed text-fg-subtle">{CERTIFICATE_DISCLAIMER}</p>
      {revoked ? (
        <p className="mt-4 text-sm font-semibold text-danger">Сертификат отозван</p>
      ) : null}
    </article>
  );
}
