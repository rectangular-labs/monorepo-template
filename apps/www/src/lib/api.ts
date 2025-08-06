import { rpcClient, rqApiClient } from "@rectangular-labs/api/client";
import { serverClient } from "@rectangular-labs/api/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { clientEnv, serverEnv } from "./env";

export const getApiClient = createIsomorphicFn()
  .server(() => {
    const request = getWebRequest();
    const client = serverClient({
      dbUrl: serverEnv().DATABASE_URL,
      url: new URL(request.url),
      // The request isn't populated in the server context, so we need to pass it in manually
      reqHeaders: request.headers,
      resHeaders: new Headers(),
    });
    return client;
  })
  .client(() => {
    const client = rpcClient(window.location.origin);
    return client;
  });

export const getRqHelper = () => rqApiClient(clientEnv().VITE_APP_URL);
