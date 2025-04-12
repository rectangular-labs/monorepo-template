import { Hono } from "hono";

export const apiRouter = new Hono().get("/", (c) =>
  c.json({ message: "Hello, World from the backend!" }),
);
