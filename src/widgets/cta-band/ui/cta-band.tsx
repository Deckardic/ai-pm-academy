import type { ReactNode } from "react";
import { Container, Reveal } from "@/shared/ui";

export function CtaBand({
  title,
  text,
  actions,
}: {
  title: string;
  text: string;
  actions: ReactNode;
}) {
  return (
    <section className="pb-24">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl bg-fg px-6 py-16 text-center text-bg sm:px-16">
            <div
              aria-hidden
              className="absolute -top-40 left-1/2 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/40 blur-3xl"
            />
            <h2 className="mx-auto max-w-2xl text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.035em]">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-bg/70">{text}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{actions}</div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
