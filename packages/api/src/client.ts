import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import contract from "./orpc-contract.json";
import type { Router, RouterClient } from "./types";

export const rpcClient: RouterClient = createORPCClient(
  new RPCLink({
    url: () => {
      if (typeof window === "undefined") {
        throw new Error("RPCLink is not allowed on the server side.");
      }

      return `${window.location.origin}/api/rpc`;
    },
  }),
);
export const rqApiClient = createORPCReactQueryUtils(rpcClient);

const openApiLink = new OpenAPILink(contract as Router, {
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("OpenAPILink is not allowed on the server side.");
    }

    return `${window.location.origin}/api`;
  },
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
