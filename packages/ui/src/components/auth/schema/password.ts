import { type } from "arktype";

export const PasswordSchema = type("8 <= string <= 128").configure({
  actual: "",
});
