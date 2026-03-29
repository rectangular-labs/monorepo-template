import { createTanstackQueryUtils, rpcClient } from "@rectangular-labs/api/client";
import { serverClient } from "@rectangular-labs/api/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getApiClient = createIsomorphicFn()
  .server(() => {
    const request = getRequest();
    const client = serverClient({
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
export const apiClient = getApiClient();
export const getApiClientRq = () => createTanstackQueryUtils(getApiClient());
