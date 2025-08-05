import { rpcClient, rqApiClient } from "@rectangular-labs/api/client";
import { createApiContext } from "@rectangular-labs/api/context";
import { serverClient } from "@rectangular-labs/api/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import {
  getCookie,
  getWebRequest,
  setCookie,
} from "@tanstack/react-start/server";
import { clientEnv, serverEnv } from "./env";

export const getApiClient = createIsomorphicFn()
  .server(() => {
    const request = getWebRequest();
    const context = createApiContext({
      cookies: {
        get: getCookie,
        set: setCookie,
      },
      dbUrl: serverEnv().DATABASE_URL,
      headers: request.headers,
    });
    return serverClient(context);
  })
  .client(() => {
    return rpcClient(window.location.origin);
  });

export const getRqHelper = createIsomorphicFn()
  .server(() => rqApiClient(clientEnv().VITE_APP_URL))
  .client(() => rqApiClient(window.location.origin));
