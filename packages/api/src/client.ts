import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import contract from "./open-api/orpc-contract.json";
import type { Router, RouterClient } from "./types";

export const rpcClient = (baseUrl: string): RouterClient =>
  createORPCClient(
    new RPCLink({
      url: `${baseUrl}/api/rpc`,
    }),
  );
export const rqApiClient = (baseUrl: string) =>
  createORPCReactQueryUtils(rpcClient(baseUrl));

const openApiLink = (baseUrl: string) =>
  new OpenAPILink(contract as Router, {
    url: `${baseUrl}/api`,
    headers: () => ({}),
    fetch: (request, init) => {
      return globalThis.fetch(request, {
        ...init,
        credentials: "include", // Include cookies for cross-origin requests
      });
    },
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });
export const openApiClient: RouterClient = createORPCClient(openApiLink);
