import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { parse } from "yaml";

type RawQuestion = {
  id: string;
  type: "single" | "multiple" | "order";
  correct?: string | string[];
  items?: { id: string }[];
};

export function loadQuiz(relative: string): Map<string, RawQuestion> {
  const raw = parse(fs.readFileSync(path.join(process.cwd(), "content", relative), "utf8")) as {
    questions: RawQuestion[];
  };
  return new Map(raw.questions.map((question) => [question.id, question]));
}

/** Answers whatever question is on screen, correctly or deliberately wrong. */
export async function answerCurrent(
  page: Page,
  questions: Map<string, RawQuestion>,
  correct = true,
) {
  const fieldset = page.locator("fieldset[data-question-id]");
  const id = await fieldset.getAttribute("data-question-id");
  const question = questions.get(id!);
  if (!question) throw new Error(`Unknown question ${id}`);

  if (question.type === "single") {
    const options = await fieldset
      .locator("[data-option-id]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-option-id")!));
    const pick = correct
      ? (question.correct as string)
      : options.find((option) => option !== question.correct)!;
    await fieldset.locator(`[data-option-id="${pick}"]`).click();
  } else if (question.type === "multiple") {
    const targets = correct ? (question.correct as string[]) : [(question.correct as string[])[0]!];
    for (const target of targets) await fieldset.locator(`[data-option-id="${target}"]`).click();
  } else {
    const expected = question.items!.map((item) => item.id);
    // Bubble into place with the «Выше» buttons.
    for (let target = 0; target < expected.length; target++) {
      const current = await fieldset
        .locator("[data-item-id]")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-item-id")!));
      let index = current.indexOf(expected[target]!);
      while (index > target) {
        await fieldset
          .locator(`[data-item-id="${expected[target]}"] button[aria-label="Выше"]`)
          .click();
        index -= 1;
      }
    }
    await expect(fieldset.locator("[data-item-id]").first()).toHaveAttribute(
      "data-item-id",
      expected[0]!,
    );
  }
}

export async function completeQuiz(
  page: Page,
  questions: Map<string, RawQuestion>,
  correct = true,
) {
  for (;;) {
    await answerCurrent(page, questions, correct);
    const finish = page.getByRole("button", { name: "Завершить" });
    if (await finish.isVisible()) {
      await finish.click();
      return;
    }
    await page.getByRole("button", { name: "Далее" }).click();
  }
}

export async function signUp(page: Page) {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.ru`;
  await page.goto("/vhod?mode=sign-up");
  await page.getByLabel("Как вас зовут").fill("Анна Тестова");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill("correct-horse-battery");
  await page.getByText("согласие на обработку персональных данных").first().locator("..").click();
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await page.waitForURL("**/kabinet/znakomstvo");
  return email;
}
