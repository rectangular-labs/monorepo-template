import { lazy } from "@orpc/server";
import { base } from "../context";
import commonAuth from "./auth/common";

export const router = base.router({
  todos: lazy(() => import("./todo")),
  auth: {
    ...commonAuth,
    passkey: lazy(() => import("./auth/passkey")),
  },
});
