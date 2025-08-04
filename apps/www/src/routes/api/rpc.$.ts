import { RpcHandler } from "@rectangular-labs/api/server";
import { createServerFileRoute } from "@tanstack/react-start/server";

async function handle({ request }: { request: Request }) {
  const { response } = await RpcHandler.handle(request, {
    prefix: "/api/rpc",
    context: {},
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
