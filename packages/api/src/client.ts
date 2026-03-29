import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import contract from "./_open-api/orpc-contract.json" with { type: "json" };
import type { Router, RouterClient } from "./types";

export { createTanstackQueryUtils } from "@orpc/tanstack-query";
export const rpcClient = (baseUrl: string): RouterClient =>
  createORPCClient(
    new RPCLink({
      url: `${baseUrl}/api/rpc`,
    }),
  );

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
export const openApiClient = (baseUrl: string): RouterClient =>
  createORPCClient(openApiLink(baseUrl));
