import type { ReactNode } from "react";
import { cn } from "@/shared/lib";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {eyebrow ? <div className="flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
      <h1 className="text-[clamp(2rem,4.5vw,3rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">{description}</p>
      ) : null}
      {actions ? <div className="mt-2 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
