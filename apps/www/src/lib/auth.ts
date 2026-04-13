import { createBetterAuthActions } from "@rectangular-labs/auth/adapter/better-auth";
import type { CallbackURLs } from "@rectangular-labs/auth/adapter/types";
import { createAuthClient } from "@rectangular-labs/auth/client";
import { clientEnv } from "./env";

export const authClient = createAuthClient({ baseURL: clientEnv().VITE_APP_URL });

export const authAdapter = createBetterAuthActions(
  authClient,
  clientEnv().VITE_AUTH_EMAIL_VERIFICATION_TYPE,
);

export function createLoginCallbackURLs(next?: string): CallbackURLs {
  const destination = encodeURIComponent(next || "/dashboard");

  return {
    success: `/login/callback?next=${destination}`,
    newUser: `/login/callback?next=${destination}`,
    error: `/login/callback?next=${destination}`,
    resetPassword: `/login/reset-password?next=${destination}`,
  };
}
