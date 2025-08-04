import { experimental_ArkTypeToJsonSchemaConverter as ArkTypeToJsonSchemaConverter } from "@orpc/arktype";
import { experimental_SmartCoercionPlugin as SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { createRouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "./routes";

export const serverClient = ({
  headers,
}: {
  headers: Record<string, string | undefined>;
}) =>
  createRouterClient(router, {
    context: () => ({
      headers,
    }),
  });

export const RpcHandler = new RPCHandler(router, {});

export const openAPIHandler = new OpenAPIHandler(router, {
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
      },
      docsPath: "/docs",
      specPath: "/openapi.json",
    }),
  ],
});
