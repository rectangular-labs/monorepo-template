import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

export const frontendRouter = new Hono()
  .get(
    "*",
    serveStatic({
      root: "../www/dist",
    }),
  )
  .get(
    "*",
    serveStatic({
      path: "../www/dist/index.html",
    }),
  );
