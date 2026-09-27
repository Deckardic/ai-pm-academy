import { describe, expect, it } from "vitest";
import { computeLevelProgress } from "@/entities/progress";
import { fillPrompt, extractVariables } from "@/entities/prompt";
import { extractHeadings, mdxToMarkdown, typo } from "@/shared/content/index.server";
import { pluralize } from "@/shared/lib";

describe("pluralize", () => {
  it.each([
    [1, "урок"],
    [2, "урока"],
    [5, "уроков"],
    [11, "уроков"],
    [21, "урок"],
    [104, "урока"],
  ])("%i → %s", (count, expected) => {
    expect(pluralize(count, ["урок", "урока", "уроков"])).toBe(expected);
  });
});

describe("typograf", () => {
  it("sets quotes and dashes, keeps boundary spaces", () => {
    expect(typo('Проект - это "временная" работа ')).toBe("Проект — это «временная» работа ");
  });
});

describe("prompts", () => {
  it("fills variables and marks empty ones", () => {
    expect(
      fillPrompt(
        "Проект: {{project}}, срок: {{ deadline }}",
        { project: "CRM" },
        { deadline: "Срок" },
      ),
    ).toBe("Проект: CRM, срок: [Срок]");
    expect(extractVariables("{{a}} {{b}} {{a}}")).toEqual(["a", "b"]);
  });
});

describe("mdx helpers", () => {
  it("extracts ## and ### headings with slug ids, ignoring code", () => {
    const headings = extractHeadings(
      "## Что такое WBS\n```\n## not a heading\n```\n### Правило 100%\n",
    );
    expect(headings).toEqual([
      { id: "что-такое-wbs", text: "Что такое WBS", depth: 2 },
      { id: "правило-100", text: "Правило 100%", depth: 3 },
    ]);
  });

  it("strips JSX components but keeps prose for llms-full.txt", () => {
    const md = mdxToMarkdown(
      'Текст\n\n<Callout type="important">\nВнутри\n</Callout>\n\n<InlineQuiz question="?" options={["a"]} correct={0} />\n',
    );
    expect(md).toContain("Внутри");
    expect(md).not.toContain("<");
  });
});

describe("level progress", () => {
  const modules = [
    {
      id: "j01",
      quizId: "j01-quiz",
      lessonIds: ["j01-01", "j01-02"],
      status: "published" as const,
    },
    { id: "j02", quizId: null, lessonIds: [], status: "planned" as const },
  ];

  it("counts lessons and tests, finds the next lesson", () => {
    const progress = computeLevelProgress(modules, new Set(["j01-01"]), new Set());
    expect(progress.ratio).toBeCloseTo(1 / 3);
    expect(progress.nextLessonId).toBe("j01-02");
    expect(progress.examUnlocked).toBe(false);
  });

  it("unlocks the exam when every module test is passed", () => {
    expect(computeLevelProgress(modules, new Set(), new Set(["j01-quiz"])).examUnlocked).toBe(true);
  });
});
