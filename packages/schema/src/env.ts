import { type } from "arktype";

export const ClientEnv = type({
  VITE_BACKEND_URL: "string",
});
export const parseClientEnv = (env: unknown) => {
  const result = ClientEnv(env);
  if (result instanceof type.errors) {
    throw new Error(result.summary);
  }
  return result;
};
export type ClientEnv = typeof ClientEnv.infer;

export const ServerEnv = type({
  BETTER_AUTH_SECRET: "string",
  BETTER_AUTH_URL: "string",
});
export const parseServerEnv = (env: unknown) => {
  const result = ServerEnv(env);
  if (result instanceof type.errors) {
    throw new Error(result.summary);
  }
  return result;
};

export type ServerEnv = typeof ServerEnv.infer;
