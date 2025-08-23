import { createAuthClient as createAuthClientBase } from "better-auth/react";
import { authEnv } from "./env";

export const createAuthClient = (): ReturnType<typeof createAuthClientBase> => {
  const env = authEnv();
  return createAuthClientBase({
    baseURL: env.VITE_APP_URL,
  });
};
