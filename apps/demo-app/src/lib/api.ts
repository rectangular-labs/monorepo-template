import { createTanstackQueryUtils, rpcClient } from "@rectangular-labs/api/client";
import { serverClient } from "@rectangular-labs/api/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { serverEnv } from "./env";

export function createApiContextParam({ request }: { request: Request }) {
  const url = new URL(request.url.replace("localhost", "localhost:7070"));
  return {
    reqHeaders: request.headers,
    resHeaders: new Headers(),
    url,
    credentialVerificationType: serverEnv().VITE_AUTH_EMAIL_VERIFICATION_TYPE,
  };
}

const getApiClient = createIsomorphicFn()
  .server(() => {
    const request = getRequest();
    const client = serverClient(createApiContextParam({ request }));
    return client;
  })
  .client(() => {
    const client = rpcClient(window.location.origin);
    return client;
  });

export const apiRQ = createTanstackQueryUtils(getApiClient(), {
  experimental_defaults: {
    auth: {
      session: {
        current: {
          queryOptions: {
            staleTime: 1000 * 15, // 15 seconds
            gcTime: 1000 * 60, // 60 seconds
          },
        },
      },
    },
  },
});
