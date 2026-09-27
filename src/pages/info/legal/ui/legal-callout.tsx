import type { ReactNode } from "react";

export function LegalCallout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="not-prose rounded-xl bg-warning-soft px-5 py-4 text-[0.9375rem] leading-relaxed">
      {title ? <p className="font-semibold text-warning">{title}</p> : null}
      <div className="mt-1 text-fg/85">{children}</div>
    </aside>
  );
}
