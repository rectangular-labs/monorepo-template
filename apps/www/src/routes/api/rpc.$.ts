import { createApiContext } from "@rectangular-labs/api/context";
import { RpcHandler } from "@rectangular-labs/api/server";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { serverEnv } from "~/lib/env";

async function handle({ request }: { request: Request }) {
  const context = createApiContext({
    dbUrl: serverEnv().DATABASE_URL,
    url: new URL(request.url),
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
