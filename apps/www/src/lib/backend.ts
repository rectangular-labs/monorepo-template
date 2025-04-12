import type { AppType } from "@rectangular-labs/backend";
import { hc } from "hono/client";

export const backend = hc<AppType>("https://localhost:6969");
