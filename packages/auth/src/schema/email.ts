import { type } from "arktype";

export const EmailSchema = type("string.email").configure({
  message: "Please enter a valid email address",
});
