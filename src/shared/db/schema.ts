import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ---------------------------------------------------------------------------
 * Better Auth core tables
 * ------------------------------------------------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  // Additional fields
  role: text("role").notNull().default("user"),
  /** Optional Latin spelling of the name for the certificate. */
  nameLatin: text("name_latin"),
  /** 152-ФЗ: when the separate consent to personal data processing was given. */
  pdConsentAt: timestamp("pd_consent_at", { withTimezone: true }),
  pdConsentVersion: text("pd_consent_version"),
  /** Onboarding answers (role, experience, goal, AI restrictions). */
  onboarding: jsonb("onboarding").$type<OnboardingAnswers>(),
  emailReminders: boolean("email_reminders").notNull().default(false),
});

export type OnboardingAnswers = {
  role: string;
  experience: "none" | "lt1" | "1to4" | "5plus";
  goal: string;
  aiRestricted: "yes" | "no" | "unknown";
  recommendedLevel: "junior" | "middle" | "senior";
};

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* ---------------------------------------------------------------------------
 * Learning data. Content lives in Git; rows reference stable content ids.
 * ------------------------------------------------------------------------- */

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    /** Lesson version at completion — a regenerated lesson shows «Обновлён». */
    lessonVersion: integer("lesson_version").notNull().default(1),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.lessonId] })],
);

export const quizAttempt = pgTable(
  "quiz_attempt",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    quizId: text("quiz_id").notNull(),
    kind: text("kind", { enum: ["module", "exam"] }).notNull(),
    levelSlug: text("level_slug").notNull(),
    moduleId: text("module_id"),
    contentVersion: text("content_version").notNull(),
    /** Server-side sample: grading only ever considers these questions. */
    questionIds: jsonb("question_ids").$type<string[]>().notNull(),
    answers: jsonb("answers").$type<Record<string, string | string[]>>(),
    score: real("score"),
    passed: boolean("passed"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [
    index("quiz_attempt_user_quiz_idx").on(table.userId, table.quizId),
    index("quiz_attempt_user_level_idx").on(table.userId, table.levelSlug),
  ],
);

export const assignmentSubmission = pgTable(
  "assignment_submission",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assignmentId: text("assignment_id").notNull(),
    moduleId: text("module_id").notNull(),
    text: text("text"),
    link: text("link"),
    checklist: jsonb("checklist").$type<boolean[]>().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("assignment_user_unique").on(table.userId, table.assignmentId)],
);

export const certificate = pgTable(
  "certificate",
  {
    id: text("id").primaryKey(),
    /** Public verification code, e.g. AIPM-J-7K2Q-9XMD. */
    code: text("code").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    levelSlug: text("level_slug").notNull(),
    fullName: text("full_name").notNull(),
    fullNameLatin: text("full_name_latin"),
    contentVersion: text("content_version").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("certificate_user_level_unique").on(table.userId, table.levelSlug)],
);

export const lessonFeedback = pgTable(
  "lesson_feedback",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    /** Lesson id or quiz question id (kind = "question-error"). */
    targetId: text("target_id").notNull(),
    kind: text("kind", { enum: ["rating", "lesson-error", "question-error"] }).notNull(),
    rating: integer("rating"),
    comment: text("comment"),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    index("lesson_feedback_target_idx").on(table.targetId),
    index("lesson_feedback_open_idx")
      .on(table.resolved)
      .where(sql`${table.resolved} = false`),
  ],
);
