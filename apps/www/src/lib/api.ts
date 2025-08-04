import { rpcClient, rqApiClient } from "@rectangular-labs/api/client";
import { serverClient } from "@rectangular-labs/api/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { clientEnv } from "./env";

export const getApiClient = createIsomorphicFn()
  .server(() => {
    return serverClient({ headers: getHeaders() });
  })
  .client(() => {
    return rpcClient(window.location.origin);
  });

export const getRqHelper = createIsomorphicFn()
  .server(() => rqApiClient(clientEnv().VITE_APP_URL))
  .client(() => rqApiClient(window.location.origin));
