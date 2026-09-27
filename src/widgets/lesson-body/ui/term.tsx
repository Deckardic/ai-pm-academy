import Link from "next/link";
import type { ReactNode } from "react";
import type { GlossaryTerm } from "@/entities/glossary";
import { routes } from "@/shared/config";
import { Tooltip } from "@/shared/ui";

/** Hover shows the definition; tap (touch) follows the link to the glossary. */
export function Term({ term, children }: { term: GlossaryTerm | null; children: ReactNode }) {
  if (!term) return <>{children}</>;
  return (
    <Tooltip
      content={
        <span className="flex flex-col gap-1">
          <span className="font-semibold">
            {term.term}
            {term.en ? <span className="font-normal opacity-70"> · {term.en}</span> : null}
          </span>
          <span className="opacity-85">{term.short}</span>
        </span>
      }
    >
      <Link
        href={routes.glossaryTerm(term.slug)}
        data-plain
        className="cursor-help underline decoration-fg-subtle decoration-dotted underline-offset-4 transition-colors duration-150 ease-[ease] hover:decoration-accent"
      >
        {children}
      </Link>
    </Tooltip>
  );
}
