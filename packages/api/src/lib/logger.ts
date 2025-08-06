import { os } from "@orpc/server";

export const loggerMiddleware = os.middleware(
  async ({ next, procedure, path }) => {
    const { route } = procedure["~orpc"];
    const start = Date.now();
    console.log(`-> ${route.method}: ${route.path} (${path.join("/")})`);
    const result = await next();
    const end = Date.now();
    console.log(
      `<- ${route.method}: ${route.path} (${path.join("/")}) ${end - start}ms`,
    );
    return result;
  },
);
