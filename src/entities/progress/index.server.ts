export {
  getCompletedLessons,
  isLessonCompleted,
  setLessonCompleted,
  type CompletedLesson,
} from "./api/lessons";
export {
  completeAttempt,
  createAttempt,
  getAttempt,
  getLastSubmittedAttempt,
  getPassedQuizIds,
  getSubmittedAttempts,
  type QuizAttempt,
} from "./api/attempts";
export {
  getSubmission,
  getSubmissions,
  upsertSubmission,
  type Submission,
} from "./api/submissions";
export { saveFeedback } from "./api/feedback";
export * from "./index";
