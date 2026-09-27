import Typograf from "typograf";

const typograf = new Typograf({
  locale: ["ru", "en-US"],
  htmlEntity: { type: "default" },
});

// Text is processed node by node (MDX) or field by field (YAML): keep the
// boundary spaces, otherwise "текст **жирный**" collapses into "текст**жирный**".
typograf.disableRule([
  "common/space/trimLeft",
  "common/space/trimRight",
  "common/space/delLeadingBlanks",
  "common/space/delTrailingBlanks",
  "common/space/insertFinalNewline",
]);

/** Russian typography: «ёлочки», em dashes, non-breaking spaces, ellipsis. */
export function typo(text: string): string {
  return typograf.execute(text);
}
