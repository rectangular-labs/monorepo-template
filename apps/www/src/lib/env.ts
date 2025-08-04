import { parseClientEnv, parseServerEnv } from "@rectangular-labs/env";

export const clientEnv = () => parseClientEnv(import.meta.env);
export const serverEnv = () => parseServerEnv(import.meta.env);
