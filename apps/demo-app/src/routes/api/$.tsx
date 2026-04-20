import { createApiContext } from "@rectangular-labs/api/context";
import { openAPIHandler } from "@rectangular-labs/api/server";
import { createFileRoute } from "@tanstack/react-router";
import { createApiContextParam } from "~/lib/api";
import { serverEnv } from "~/lib/env";

async function handle({ request }: { request: Request }) {
  const context = createApiContext(createApiContextParam({ request }));

  const requestUrl = new URL(request.url);
  if (requestUrl.pathname.startsWith("/api/auth/")) {
    return context.auth.handler(request);
  }

  const env = serverEnv();
  const { response } = await openAPIHandler(`${env.VITE_APP_URL}/api`).handle(request, {
    prefix: "/api",
    context,
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/$")({
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
