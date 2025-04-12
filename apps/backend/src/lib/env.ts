import { parseServerEnv } from "@rectangular-labs/env";
import { env as honoEnv } from "hono/adapter";
import { getContext } from "hono/context-storage";

export const env = () => {
  const context = getContext();
  return parseServerEnv(honoEnv(context));
};
