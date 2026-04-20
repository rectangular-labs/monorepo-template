import { createApiContext } from "@rectangular-labs/api/context";
import { RpcHandler } from "@rectangular-labs/api/server";
import { createFileRoute } from "@tanstack/react-router";
import { createApiContextParam } from "~/lib/api";

async function handle({ request }: { request: Request }) {
  const context = createApiContext(createApiContextParam({ request }));

  const { response } = await RpcHandler.handle(request, {
    prefix: "/api/rpc",
    context,
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      DELETE: handle,
      GET: handle,
      HEAD: handle,
      PATCH: handle,
      POST: handle,
      PUT: handle,
    },
  },
});
