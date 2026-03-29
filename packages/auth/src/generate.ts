import { type DB } from "@rectangular-labs/db";
import { initAuthHandler } from "./server";

// Used simply to generate the schema for the auth database
export const auth = initAuthHandler({
  baseURL: "http://localhost:3000",
  credentialVerificationType: "token",
  db: {} as DB,
  encryptionKey: "0123456789abcdef0123456789abcdef",
  fromEmail: "no-reply@example.com",
});
