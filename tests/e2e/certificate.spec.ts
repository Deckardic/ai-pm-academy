import { expect, test } from "./fixtures";
import fs from "node:fs";
import path from "node:path";
import { completeQuiz, loadQuiz, signUp } from "./helpers";

// Every published Junior module with a test: the certificate requires all of them.
const juniorDir = path.join(process.cwd(), "content/course/junior");
const junior = fs
  .readdirSync(juniorDir)
  .filter((dir) => fs.existsSync(path.join(juniorDir, dir, "quiz.yaml")))
  .sort()
  .map((dir) => ({
    slug: dir.replace(/^j\d{2}-/, ""),
    quiz: `course/junior/${dir}/quiz.yaml`,
  }));

test("all mod tests → final exam → certificate with public verification", async ({
  page,
  browser,
}) => {
  test.setTimeout(300_000);
  await signUp(page);

  for (const mod of junior) {
    await page.goto(`/junior/${mod.slug}/test`);
    await page.getByRole("button", { name: /Начать тест/ }).click();
    await completeQuiz(page, loadQuiz(mod.quiz), true);
    await expect(page.getByText("Тест пройден")).toBeVisible();
  }

  await page.goto("/junior/ekzamen");
  await page.getByRole("button", { name: /Начать экзамен/ }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await completeQuiz(page, loadQuiz("course/junior/_exam.yaml"), true);
  await page.getByRole("link", { name: /Открыть сертификат/ }).click();
  await page.waitForURL(/\/sertifikat\/AIPM-J-/);
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
  await page.goto("/junior/ekzamen");
  await expect(page.getByText("Экзамен сдан — сертификат уже ваш.")).toBeVisible();
});
