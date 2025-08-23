import { os } from "@orpc/server";
import type { InitialContext } from "../types";

export const authMiddleware = os
  .$context<InitialContext>()
  .middleware(async ({ next, context }) => {
    const auth = context.auth;
    const session = await auth.api.getSession({
      headers: context.reqHeaders ?? new Headers(),
    });

    return await next({
      context: {
        ...context,
        session,
      },
    });
  });
