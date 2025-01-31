import { Schema } from "effect";

export const OtpSchema = Schema.Struct({
  code: Schema.String.pipe(
    Schema.length(8, {
      message: () => "Code must be 8 characters long.",
    }),
    Schema.pattern(/^[A-Z2-7]+$/, {
      message: () => "Invalid Code provided, please check and try again.",
    }),
  ),
});
export type OtpSchema = typeof OtpSchema.Type;
