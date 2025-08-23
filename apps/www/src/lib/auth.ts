import { initAuthHandler } from "@rectangular-labs/auth";
import { createAuthClient } from "@rectangular-labs/auth/client";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

export const getCurrentSession = createIsomorphicFn()
  .server(async () => {
    const auth = initAuthHandler();
    const request = getWebRequest();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  })
  .client(async () => {
    const auth = createAuthClient();
    const session = await auth.getSession();
    return session.data;
  });

export const authClient = createAuthClient();
