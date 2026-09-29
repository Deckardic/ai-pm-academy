import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

/**
 * WCAG 2.2 AA audit of key pages (PRD acceptance criterion 9).
 * Runs axe-core against the production build in both colour schemes.
 */
const pages = [
  "/",
  "/kurs",
  "/junior",
  "/junior/kto-takoy-pm",
  "/junior/kto-takoy-pm/proekt-produkt-operacii",
  "/middle/ocenka-i-prognoz/prognoz-monte-karlo",
  "/biblioteka/prompty",
  "/biblioteka/shablony",
  "/glossariy",
  "/test-urovnya",
  "/vhod",
];

for (const scheme of ["light", "dark"] as const) {
  for (const path of pages) {
    test(`a11y (${scheme}): ${path}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const violations = results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.slice(0, 5).map((node) => node.target.join(" ")),
      }));
      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });
  }
}
