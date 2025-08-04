import { lazy, os } from "@orpc/server";

export const router = os.router({
  todos: lazy(() => import("./todo")),
});
