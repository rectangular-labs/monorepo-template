import { Schema } from "effect";

const EnvSchema = Schema.Struct({
  NODE_ENV: Schema.Literal("production", "development", "test", "preview"),
});
type EnvSchema = typeof EnvSchema.Type;
type AddUndefined<T> = {
  [P in keyof T]: (T[P] extends string ? string : T[P]) | undefined;
};

export const env = Schema.decodeUnknownSync(EnvSchema)({
  NODE_ENV: process.env.NODE_ENV,
} satisfies AddUndefined<EnvSchema>);
