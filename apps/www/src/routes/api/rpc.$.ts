import { createApiContext } from "@rectangular-labs/api/context";
import { RpcHandler } from "@rectangular-labs/api/server";
import {
  createServerFileRoute,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";
import { serverEnv } from "~/lib/env";

async function handle({ request }: { request: Request }) {
  const context = createApiContext({
    dbUrl: serverEnv().DATABASE_URL,
    headers: request.headers,
    cookies: { get: getCookie, set: setCookie },
  });

  const { response } = await RpcHandler.handle(request, {
    prefix: "/api/rpc",
    context,
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute("/api/rpc/$").methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
