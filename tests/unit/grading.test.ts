import { describe, expect, it } from "vitest";
import {
  grade,
  pickQuestions,
  scorePlacement,
  shuffle,
  toPublicQuestion,
  type Quiz,
} from "@/entities/quiz/index.server";

const quiz: Quiz = {
  id: "t-quiz",
  kind: "module",
  title: "Тест",
  passScore: 0.7,
  questionsPerAttempt: 3,
  questions: [
    {
      id: "s",
      type: "single",
      prompt: "?",
      explanation: "e",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correct: "b",
    },
    {
      id: "m",
      type: "multiple",
      prompt: "?",
      explanation: "e",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
        { id: "c", text: "C" },
      ],
      correct: ["a", "c"],
    },
    {
      id: "o",
      type: "order",
      prompt: "?",
      explanation: "e",
      items: [
        { id: "1", text: "1" },
        { id: "2", text: "2" },
        { id: "3", text: "3" },
      ],
    },
  ],
};

describe("grading", () => {
  it("grades single, multiple (as a set) and order questions", () => {
    const result = grade(quiz, ["s", "m", "o"], { s: "b", m: ["c", "a"], o: ["1", "2", "3"] });
    expect(result.correctCount).toBe(3);
    expect(result.passed).toBe(true);
  });

  it("fails partial multiple answers and wrong order", () => {
    const result = grade(quiz, ["s", "m", "o"], { s: "b", m: ["a"], o: ["2", "1", "3"] });
    expect(result.correctCount).toBe(1);
    expect(result.passed).toBe(false);
    expect(result.results.find((item) => item.questionId === "o")?.correctAnswer).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("only grades the questions of the attempt", () => {
    const result = grade(quiz, ["s"], { s: "b", m: ["a", "c"] });
    expect(result.total).toBe(1);
  });

  it("never leaks answers to the client", () => {
    for (const question of quiz.questions) {
      const serialized = JSON.stringify(toPublicQuestion(question));
      expect(serialized).not.toContain("correct");
      expect(serialized).not.toContain("explanation");
    }
  });

  it("never sends an order question in its correct order", () => {
    const order = quiz.questions[2]!;
    for (let i = 0; i < 50; i++) {
      const pub = toPublicQuestion(order);
      if (pub.type !== "order") throw new Error("expected order");
      expect(pub.items.map((item) => item.id)).not.toEqual(["1", "2", "3"]);
    }
  });

  it("samples questionsPerAttempt questions", () => {
    expect(pickQuestions({ ...quiz, questionsPerAttempt: 2 })).toHaveLength(2);
  });

  it("shuffle keeps all items", () => {
    expect(shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe("placement", () => {
  const placement: Quiz = {
    ...quiz,
    kind: "placement",
    questions: [
      {
        id: "j1",
        level: "junior",
        type: "single",
        prompt: "?",
        explanation: "e",
        options: [
          { id: "a", text: "A" },
          { id: "b", text: "B" },
        ],
        correct: "a",
      },
      {
        id: "m1",
        level: "middle",
        area: "ai",
        type: "single",
        prompt: "?",
        explanation: "e",
        options: [
          { id: "a", text: "A" },
          { id: "b", text: "B" },
        ],
        correct: "a",
      },
    ],
  };

  it("recommends junior when basics are missing", () => {
    expect(scorePlacement(placement, { j1: "b", m1: "a" }).recommended).toBe("junior");
  });

  it("recommends middle when junior questions are solid", () => {
    expect(scorePlacement(placement, { j1: "a", m1: "b" }).recommended).toBe("middle");
  });

  it("splits results by area", () => {
    expect(scorePlacement(placement, { j1: "a", m1: "a" }).byArea.ai).toEqual({
      correct: 1,
      total: 1,
    });
  });
});
