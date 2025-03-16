import { type } from "arktype";

export const OtpSchema = type({
  code: "string > 8",
});
export type OtpSchema = typeof OtpSchema.infer;
