import { expect, test } from "./fixtures";

test("home page renders the offer and key sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("работает с");
  await expect(page.getByRole("link", { name: /Начать с Junior/ })).toBeVisible();
  await expect(page.getByText("Одна траектория")).toBeVisible();
});

test("lesson page: content, inline quiz and prompt copy", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/junior/kto-takoy-pm/kak-ii-menyaet-rabotu-pm");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Как ИИ меняет работу PM");
  const copy = page.getByRole("button", { name: "Скопировать" }).first();
  await copy.click();
  await expect(page.getByText("Скопировано").first()).toBeVisible();
});

test("SEO and GEO endpoints", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("GPTBot");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/junior/planirovanie/wbs");
  const llms = await request.get("/llms.txt");
  expect(await llms.text()).toContain("# AI PM Academy");
});

test("cookie banner: shown to new visitors, remembers the choice", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  const banner = page.getByRole("region", { name: "Согласие на cookie" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Только обязательные" }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(page.getByRole("region", { name: "Согласие на cookie" })).toHaveCount(0);
  await context.close();
});

test("no horizontal scroll on key pages", async ({ page }) => {
  for (const path of [
    "/",
    "/kurs",
    "/junior",
    "/junior/planirovanie",
    "/junior/planirovanie/wbs",
    "/biblioteka/prompty",
    "/biblioteka/shablony/ustav-proekta",
    "/glossariy",
    "/test-urovnya",
    "/vhod",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});
