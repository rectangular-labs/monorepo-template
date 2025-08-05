import { createApiContext } from "@rectangular-labs/api/context";
import { openAPIHandler } from "@rectangular-labs/api/server";
import { parseServerEnv } from "@rectangular-labs/env";
import {
  createServerFileRoute,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";

async function handle({ request }: { request: Request }) {
  const env = parseServerEnv(process.env);
  const context = createApiContext({
    dbUrl: env.DATABASE_URL,
    headers: request.headers,
    cookies: { get: getCookie, set: setCookie },
  });

  const { response } = await openAPIHandler(`${env.VITE_APP_URL}/api`).handle(
    request,
    {
      prefix: "/api",
      context,
    },
  );

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
