import { createApiContext } from "@rectangular-labs/api/context";
import { createAuthClient } from "@rectangular-labs/auth/client";
import { queryOptions } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { clientEnv } from "./env";

const baseURL = clientEnv().VITE_APP_URL;

export const authClient = createAuthClient({ baseURL });

export const getCurrentSession = createIsomorphicFn()
  .server(async () => {
    const request = getRequest();
    const { auth } = createApiContext({
      reqHeaders: request.headers,
      resHeaders: new Headers(),
      url: new URL(request.url),
    });

    return await auth.api.getSession({
      headers: request.headers,
    });
  })
  .client(async () => {
    const response = await authClient.getSession();
    return response.data ?? null;
  });

export const getCurrentSessionQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "session", "current"],
    queryFn: getCurrentSession,
    staleTime: 15 * 1000,
  });
