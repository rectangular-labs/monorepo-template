import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient as createAuthClientBase } from "better-auth/react";
import { authEnv } from "./env";

export const createAuthClient = (): ReturnType<
  typeof createAuthClientBase<{
    baseURL: string;
    plugins: [ReturnType<typeof emailOTPClient>];
  }>
> => {
  const env = authEnv();
  return createAuthClientBase({
    baseURL: env.VITE_APP_URL,
    plugins: [emailOTPClient()],
  });
};
