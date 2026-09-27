import { test as base } from "@playwright/test";

/** Every test starts with the cookie choice already made, so the banner never covers the UI under test. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("aipm-cookie-consent", "essential");
      } catch {}
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
