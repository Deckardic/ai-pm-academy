/**
 * Client-safe shapes: no correct answers, no explanations. The client only
 * ever sees these until an attempt is graded on the server.
 */
export type PublicOption = { id: string; text: string };

export type PublicQuestion =
  | { id: string; type: "single"; scenario?: string; prompt: string; options: PublicOption[] }
  | { id: string; type: "multiple"; scenario?: string; prompt: string; options: PublicOption[] }
  | { id: string; type: "order"; scenario?: string; prompt: string; items: PublicOption[] };

export type Answer = string | string[];
export type Answers = Record<string, Answer>;

export type QuestionResult = {
  questionId: string;
  correct: boolean;
  /** Human-readable correct answer(s), in order. */
  correctAnswer: string[];
  explanation: string;
  lessonId?: string;
};

export type GradeResult = {
  score: number;
  correctCount: number;
  total: number;
  passed: boolean;
  results: QuestionResult[];
};
