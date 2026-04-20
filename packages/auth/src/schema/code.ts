import { type } from "arktype";

export const CodeSchema = type("string").narrow((code, ctx) => {
  if (code.length !== 6 || Number.isNaN(parseInt(code, 10))) {
    return ctx.reject({ expected: "a valid code", actual: "" });
  }
  return true;
});
