import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { createRouterClient, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {
  RequestHeadersPlugin,
  ResponseHeadersPlugin,
} from "@orpc/server/plugins";
import { createApiContext } from "./context";
import { router } from "./routes";
import { todoSchema } from "./routes/todo";

export const serverClient = (context: Parameters<typeof createApiContext>[0]) =>
  createRouterClient(router, {
    context: () => createApiContext(context),
  });

export const RpcHandler = new RPCHandler(router, {
  plugins: [new RequestHeadersPlugin(), new ResponseHeadersPlugin()],
  interceptors: [
    onError((error) => {
      console.error("RPC Error:", error);
    }),
  ],
});

export const openAPIHandler = (apiUrl: string) =>
  new OpenAPIHandler(router, {
    interceptors: [
      onError((error) => {
        console.error("OpenAPI Error:", error);
      }),
    ],
    plugins: [
      new RequestHeadersPlugin(),
      new ResponseHeadersPlugin(),
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
