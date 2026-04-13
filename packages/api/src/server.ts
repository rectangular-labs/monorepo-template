import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { createRouterClient, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin, RequestHeadersPlugin, ResponseHeadersPlugin } from "@orpc/server/plugins";
import { type } from "arktype";
import { createApiContext } from "./context";
import { router } from "./routes";
import { todoSchema } from "./routes/todo";

export const serverClient = (context: Parameters<typeof createApiContext>[0]) =>
  createRouterClient(router, {
    context: () => createApiContext(context),
  });

const corsPlugin = new CORSPlugin({
  origin: (origin) => {
    const rectangularLabsRegex = /^https:\/\/(?:preview\.|pr-\d+\.|www\.)?rectangularlabs\.com/;
    const match = rectangularLabsRegex.test(origin);
    if (match) {
      return origin;
    }
    return null;
  },
  allowMethods: ["GET", "HEAD", "POST", "DELETE", "PATCH"],
  credentials: true,
  maxAge: 600,
});

export const RpcHandler = new RPCHandler(router, {
  plugins: [corsPlugin, new RequestHeadersPlugin(), new ResponseHeadersPlugin()],
  interceptors: [
    onError((error) => {
      console.error("RPC Error:", error instanceof type.errors ? error.summary : error);
    }),
  ],
});

export const openAPIHandler = (apiUrl: string) =>
  new OpenAPIHandler(router, {
    interceptors: [
      onError((error) => {
        console.error("OpenAPI Error:", error instanceof type.errors ? error.summary : error);
      }),
    ],
    plugins: [
      corsPlugin,
      new RequestHeadersPlugin(),
      new ResponseHeadersPlugin(),
      new SmartCoercionPlugin({
        schemaConverters: [new ArkTypeToJsonSchemaConverter()],
      }),
      new OpenAPIReferencePlugin({
        schemaConverters: [new ArkTypeToJsonSchemaConverter()],
        docsPath: "/docs",
        specPath: "/openapi.json",
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
      }),
    ],
  });
