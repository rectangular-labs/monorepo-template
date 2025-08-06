import { schema } from "@rectangular-labs/db";
import type { SelectUser } from "@rectangular-labs/db/schema/user";
import { type } from "arktype";
import { base } from "../../context";
import { apiEnv } from "../../env";
import { useSession } from "../../lib/session";

export interface SessionUser {
  userId: SelectUser["id"];
}

export const getAuthedSession = async () => {
  return await useSession<SessionUser>({
    name: "app_session",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    password: apiEnv().ENCRYPTION_KEY,
  });
};

const getCurrentUser = base
  .route({
    method: "GET",
    path: "/me",
  })
  .input(type({}))
  .output(
    type({
      user: schema.selectUserSchema
        .omit("createdAt", "updatedAt", "deletedAt")
        .or("null"),
    }),
  )
  .handler(async ({ context }) => {
    const authedSession = await getAuthedSession();
    const { data: sessionData } = authedSession;
    if (!sessionData) {
      return { user: null };
    }

    const user = await context.db.query.userTable.findFirst({
      where: (table, { eq }) => eq(table.id, sessionData.userId),
    });
    return { user: user ?? null };
  });

const logout = base
  .route({
    method: "POST",
    path: "/logout",
  })
  .input(type({}))
  .output(type({ success: "boolean" }))
  .handler(async () => {
    const authedSession = await getAuthedSession();
    return await authedSession
      .clear()
      .then(() => ({ success: true }))
      .catch(() => ({ success: false }));
  });

export default base.prefix("/auth").router({
  getCurrentUser,
  logout,
});
