import { lazy } from "@orpc/server";

export const router = {
  auth: {
    session: lazy(() => import("./auth/session")),
  },
  todos: lazy(() => import("./todo")),
};
