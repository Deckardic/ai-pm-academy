import { expect, test } from "./fixtures";
import fs from "node:fs";
import path from "node:path";
import { completeQuiz, loadQuiz, signUp } from "./helpers";

/** Every module of a level that has a test: the certificate requires all of them. */
function moduleTests(level: string) {
  const dir = path.join(process.cwd(), "content/course", level);
  return fs
    .readdirSync(dir)
    .filter((name) => fs.existsSync(path.join(dir, name, "quiz.yaml")))
    .sort()
    .map((name) => ({
      slug: name.replace(/^[jms]\d{2}-/, ""),
      quiz: `course/${level}/${name}/quiz.yaml`,
    }));
}

const levels = [
  { slug: "junior", letter: "J" },
  { slug: "middle", letter: "M" },
];

for (const level of levels) {
  test(`${level.slug}: all module tests → final exam → certificate with public verification`, async ({
    page,
    browser,
  }) => {
    test.setTimeout(300_000);
    await signUp(page);

    for (const mod of moduleTests(level.slug)) {
      await page.goto(`/${level.slug}/${mod.slug}/test`);
      await page.getByRole("button", { name: /Начать тест/ }).click();
      await completeQuiz(page, loadQuiz(mod.quiz), true);
      await expect(page.getByText("Тест пройден")).toBeVisible();
    }

    await page.goto(`/${level.slug}/ekzamen`);
    await page.getByRole("button", { name: /Начать экзамен/ }).click();
    await expect(page.getByRole("timer")).toBeVisible();
    await completeQuiz(page, loadQuiz(`course/${level.slug}/_exam.yaml`), true);
    await page.getByRole("link", { name: /Открыть сертификат/ }).click();
    await page.waitForURL(new RegExp(`/sertifikat/AIPM-${level.letter}-`));
    await expect(page.getByText("Сертификат действителен")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Анна Тестова" })).toBeVisible();
    const url = page.url();

    // Anyone with the link can verify it — no account needed, and no owner tools.
    const anonymous = await browser.newContext();
    const visitor = await anonymous.newPage();
    await visitor.goto(url);
    await expect(visitor.getByText("Сертификат действителен")).toBeVisible();
    await expect(visitor.getByRole("button", { name: /Сохранить в PDF/ })).toHaveCount(0);
    await anonymous.close();

    // The exam cannot be retaken once passed.
    await page.goto(`/${level.slug}/ekzamen`);
    await expect(page.getByText("Экзамен сдан — сертификат уже ваш.")).toBeVisible();
  });
}
