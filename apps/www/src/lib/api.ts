import { rpcClient } from "@rectangular-labs/api/client";
import { serverClient } from "@rectangular-labs/api/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

const getORPCClient = createIsomorphicFn()
  .server(() => serverClient({ headers: getHeaders() }))
  .client(() => {
    return rpcClient;
  });
export const apiClient = getORPCClient();
