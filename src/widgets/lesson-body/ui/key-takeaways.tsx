import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

export function KeyTakeaways({ children }: { children: ReactNode }) {
  return (
    <section className="not-prose mt-10! surface-card p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <CheckCircle2 aria-hidden className="size-5 text-success" /> Главное из урока
      </h2>
      <div className="mt-3 text-[0.9375rem] leading-relaxed text-fg/85 [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:top-[0.65em] [&_li]:before:left-0.5 [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-success [&_li+li]:mt-2">
        {children}
      </div>
    </section>
  );
}
