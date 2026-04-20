import { createBetterAuthActions } from "@rectangular-labs/auth/adapter/better-auth";
import type { CallbackURLs } from "@rectangular-labs/auth/adapter/types";
import { createAuthClient } from "@rectangular-labs/auth/client";
import { clientEnv } from "./env";

export const authClient = createAuthClient({ baseURL: clientEnv().VITE_APP_URL });

export const authAdapter = createBetterAuthActions(
  authClient,
  clientEnv().VITE_AUTH_EMAIL_VERIFICATION_TYPE,
);

export function createLoginCallbackURLs(next?: string) {
  const rawNext = next || "/dashboard";
  const rawNewUserDestination = `/new-user?next=${rawNext}`;
  const destination = encodeURIComponent(rawNext);
  const newUserDestination = encodeURIComponent(rawNewUserDestination);

  return {
    postLogin: {
      success: rawNext,
      newUser: rawNewUserDestination,
      error: rawNext,
      resetPassword: `/login/reset-password?next=${destination}`,
    } satisfies CallbackURLs,
    preLogin: {
      success: `/login/callback?next=${destination}`,
      newUser: `/login/callback?next=${newUserDestination}`,
      error: `/login/callback?next=${destination}`,
      resetPassword: `/login/reset-password?next=${destination}`,
    } satisfies CallbackURLs,
  };
}
