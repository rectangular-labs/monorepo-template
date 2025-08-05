import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { createRouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import type { InitialContext } from "./context";
import { router } from "./routes";
import { todoSchema } from "./routes/todo";

export const serverClient = (context: InitialContext) =>
  createRouterClient(router, {
    context: () => context,
  });

export const RpcHandler = new RPCHandler(router, {});

export const openAPIHandler = (apiUrl: string) =>
  new OpenAPIHandler(router, {
    plugins: [
      new SmartCoercionPlugin({
        schemaConverters: [new ArkTypeToJsonSchemaConverter()],
      }),
      new OpenAPIReferencePlugin({
        schemaConverters: [new ArkTypeToJsonSchemaConverter()],
        specGenerateOptions: {
          info: {
            title: "Basic ORPC Open API",
            version: "0.0.0",
          },
          servers: [{ url: apiUrl }],
          commonSchemas: {
            Todo: {
              schema: todoSchema,
            },
            UndefinedError: { error: "UndefinedError" },
          },
        },
        docsPath: "/docs",
        specPath: "/openapi.json",
      }),
    ],
  });
