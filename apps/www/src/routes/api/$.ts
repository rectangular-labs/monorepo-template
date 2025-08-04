import { openAPIHandler } from "@rectangular-labs/api/server";
import { createServerFileRoute } from "@tanstack/react-start/server";

async function handle({ request }: { request: Request }) {
  const { response } = await openAPIHandler.handle(request, {
    prefix: "/api",
    context: {},
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const ServerRoute = createServerFileRoute("/api/$").methods({
  HEAD: handle,
  GET: handle,
  POST: handle,
  PUT: handle,
  PATCH: handle,
  DELETE: handle,
});
