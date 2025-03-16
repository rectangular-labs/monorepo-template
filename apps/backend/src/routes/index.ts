import { env } from "@/lib/env";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono()
  .use(
    "*",
    cors({
      origin: [env.BETTER_AUTH_URL],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      credentials: true,
    }),
  )
  .get("/", (c) => {
    const betterAuthUrl = env.BETTER_AUTH_URL;
    return c.json({
      message: `Hello ${betterAuthUrl} from the backend!`,
    });
  });

export default app;

export type AppType = typeof app;
