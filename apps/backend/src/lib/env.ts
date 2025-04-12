import { parseServerEnv } from "@rectangular-labs/env";
import { getContext } from "hono/context-storage";

export const env = () => {
  const context = getContext();
  return parseServerEnv(context.env);
};
