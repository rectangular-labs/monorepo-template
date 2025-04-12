import { parseServerEnv } from "@rectangular-labs/env";
import { getContext } from "hono/context-storage";
import { env as honoEnv } from "hono/adapter";

export const env = () => {
  const context = getContext();
  return parseServerEnv(honoEnv(context));
};
