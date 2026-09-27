import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth, yandex } from "better-auth/plugins/generic-oauth";
import { magicLink } from "better-auth/plugins/magic-link";
import { siteConfig } from "@/shared/config";
import { lazyDb } from "@/shared/db/index.server";
import * as schema from "@/shared/db/schema";
import { mailTemplates, sendMail } from "@/shared/mail/index.server";
import { PD_POLICY_VERSION } from "./providers";

const yandexConfigured = Boolean(process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET);
const vkConfigured = Boolean(process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET);

function authSecret(): string | undefined {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  // Build workers import this module but never sign anything; runtime requires a real secret.
  if (process.env.NEXT_PHASE === "phase-production-build")
    return "build-phase-placeholder-secret-not-used-at-runtime";
  if (process.env.NODE_ENV !== "production") return "dev-secret-change-me-in-production-please";
  return undefined; // Better Auth refuses to start without a secret in production.
}

export const auth = betterAuth({
  appName: siteConfig.name,
  baseURL: process.env.BETTER_AUTH_URL ?? siteConfig.url,
  secret: authSecret(),
  trustedOrigins: [siteConfig.url],
  database: drizzleAdapter(lazyDb, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Learning is never blocked by email confirmation; the certificate page nudges to verify.
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({ to: user.email, ...mailTemplates.resetPassword(url) });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({ to: user.email, ...mailTemplates.verifyEmail(url) });
    },
  },
  socialProviders: vkConfigured
    ? {
        vk: {
          clientId: process.env.VK_CLIENT_ID!,
          clientSecret: process.env.VK_CLIENT_SECRET!,
        },
      }
    : {},
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user", input: false },
      nameLatin: { type: "string", required: false },
      pdConsentAt: { type: "date", required: false, input: false },
      pdConsentVersion: { type: "string", required: false, input: false },
      emailReminders: { type: "boolean", defaultValue: false, required: false },
    },
    deleteUser: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  databaseHooks: {
    user: {
      create: {
        // Every sign-up path (email, magic link, OAuth) is gated by the consent checkbox in the UI.
        before: async (user) => ({
          data: { ...user, pdConsentAt: new Date(), pdConsentVersion: PD_POLICY_VERSION },
        }),
      },
    },
  },
  rateLimit: { enabled: true, window: 60, max: 60 },
  advanced: { cookiePrefix: "aipm" },
  plugins: [
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        await sendMail({ to: email, ...mailTemplates.magicLink(url) });
      },
    }),
    // Yandex ID: built-in helper; sign in via the standard signIn.social({ provider: "yandex" }).
    genericOAuth({
      config: yandexConfigured
        ? [
            yandex({
              clientId: process.env.YANDEX_CLIENT_ID!,
              clientSecret: process.env.YANDEX_CLIENT_SECRET!,
            }),
          ]
        : [],
    }),
    // Must stay last: lets server actions set auth cookies.
    nextCookies(),
  ],
});

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
