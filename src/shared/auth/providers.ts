/** Which sign-in methods are configured. Safe to pass to the client. */
export type AuthProviders = { yandex: boolean; vk: boolean };

export function getAuthProviders(): AuthProviders {
  return {
    yandex: Boolean(process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET),
    vk: Boolean(process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET),
  };
}

/** Version of the personal data policy the user consents to (152-ФЗ). Bump when the policy changes. */
export const PD_POLICY_VERSION = "2026-09-27";
