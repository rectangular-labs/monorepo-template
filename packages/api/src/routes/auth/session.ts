import { schema } from "@rectangular-labs/db";
import { type } from "arktype";
import { base, protectedBase } from "../../context";

const current = base
  .route({ method: "GET", path: "/current" })
  .input(type.undefined)
  .output(
    type({
      session: schema.sessionSelectSchema,
      user: schema.userSelectSchema,
    }).or(type.null),
  )
  .handler(({ context }) => {
    const { session, user } = context;
    if (!user || !session) {
      return null;
    }

    return {
      session: {
        ...session,
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        activeOrganizationId: session.activeOrganizationId ?? null,
      },
      user: {
        ...user,
        image: user.image ?? null,
        twoFactorEnabled: user.twoFactorEnabled ?? null,
        source: user.source ?? null,
        goal: user.goal ?? null,
      },
    };
  });

const signOut = protectedBase
  .route({ method: "POST", path: "/sign-out" })
  .input(type.undefined)
  .output(type({ success: "boolean" }))
  .handler(async ({ context }) => {
    if (!context.reqHeaders) {
      return { success: false };
    }

    const result = await context.auth.api.signOut({
      headers: context.reqHeaders,
      returnHeaders: true,
    });

    for (const [key, value] of result.headers.entries()) {
      context.resHeaders?.append(key, value);
    }

    return result.response;
  });

export default base.prefix("/session").router({ current, signOut });
