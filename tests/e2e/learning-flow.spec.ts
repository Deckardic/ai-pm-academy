import { expect, test } from "./fixtures";
import { completeQuiz, loadQuiz, signUp } from "./helpers";

test("sign up → onboarding → complete lesson → pass module test → dashboard", async ({ page }) => {
  await signUp(page);

  // Onboarding recommends a level.
  await page.getByLabel("Чем вы занимаетесь сейчас?").fill("Координатор проектов");
  await page.getByText("Нет опыта").click();
  await page.getByText("Войти в профессию").click();
  await page.locator('label:has(input[name="ai"][value="no"])').click();
  await page.getByRole("button", { name: "Подобрать уровень" }).click();
  await page.waitForURL("**/junior");
  await expect(page.getByText("Ваш прогресс")).toBeVisible();

  // Complete a lesson (optimistic toggle).
  await page.goto("/junior/kto-takoy-pm/proekt-produkt-operacii");
  await page.getByRole("button", { name: /Отметить урок пройденным/ }).click();
  await expect(page.getByRole("button", { name: /Урок пройден/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // Module test: fail once, then pass.
  const questions = loadQuiz("course/junior/j01-kto-takoy-pm/quiz.yaml");
  await page.goto("/junior/kto-takoy-pm/test");
  await page.getByRole("button", { name: /Начать тест/ }).click();
  await completeQuiz(page, questions, false);
  await expect(page.getByText("Пока не пройден")).toBeVisible();
  await expect(page.getByText("Разбор ответов")).toBeVisible();

  await page.getByRole("button", { name: /Попробовать снова/ }).click();
  await page.getByRole("button", { name: /Начать тест/ }).click();
  await completeQuiz(page, questions, true);
  await expect(page.getByText("Тест пройден")).toBeVisible();

  // Exam stays locked until every module test is passed.
  await page.goto("/junior/ekzamen");
  await expect(page.getByText("Экзамен откроется после тестов модулей")).toBeVisible();

  await page.goto("/kabinet");
  await expect(page.getByRole("heading", { name: /Привет, Анна/ })).toBeVisible();
  await expect(page.getByText("Тест: Кто такой PM сегодня")).toHaveCount(2);
});

test("placement test works without an account", async ({ page }) => {
  const questions = loadQuiz("placement-test.yaml");
  await page.goto("/test-urovnya");
  await page.getByRole("button", { name: /Пройти тест/ }).click();
  await completeQuiz(page, questions, true);
  await expect(page.getByText("Рекомендуем начать с уровня")).toBeVisible();
  await expect(page.locator("#main").getByText("Middle", { exact: true })).toBeVisible();
});
