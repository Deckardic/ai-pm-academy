import { Accordion, AccordionItem, Container, Reveal } from "@/shared/ui";
import { JsonLd } from "@/shared/lib";

export type FaqItem = { question: string; answer: string };

export function Faq({ items, title = "Частые вопросы" }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="py-24">
      <Container size="narrow">
        <Reveal>
          <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={80} className="mt-8">
          <Accordion>
            {items.map((item) => (
              <AccordionItem key={item.question} title={item.question}>
                {item.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
    </section>
  );
}
