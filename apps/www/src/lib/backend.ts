import type { AppType } from "@rectangular-labs/backend";
import { hc } from "hono/client";
import { env } from "./env";

export const backend = hc<AppType>(env.VITE_BACKEND_URL);
