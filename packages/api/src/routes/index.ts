import { lazy } from "@orpc/server";
import { base } from "../context";

export const router = base.router({
  todos: lazy(() => import("./todo")),
});
