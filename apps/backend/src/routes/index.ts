import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { serve } from "@hono/node-server";
import { frontendRouter } from "../lib/frontend";
import { apiRouter } from "./api";
import { showRoutes } from "hono/dev";
import { dbContext } from "@/lib/hono";

const app = new Hono()
  .use(contextStorage())
  .use(dbContext)
  .route("/api", apiRouter)
  .route("*", frontendRouter);

showRoutes(app, {
  verbose: true,
});

serve(
  {
    fetch: app.fetch,
    port: 3922,
  },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
  },
);

export type AppType = typeof app;
