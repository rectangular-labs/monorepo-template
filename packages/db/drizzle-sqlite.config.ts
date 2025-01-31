import type { Config } from "drizzle-kit";

if (!process.env.SQLITE_FILENAME) {
  throw new Error("SQLITE_FILENAME is not set");
}

export default {
  dialect: "sqlite",
  dbCredentials: {
    url: `../../apps/auth-server/${process.env.SQLITE_FILENAME}`,
  },
  schema: "./src/schema/sqlite/*",

  out: "./migrations",
  breakpoints: true,
  verbose: true,
  strict: true,
  casing: "snake_case",
  tablesFilter: "ra_*",
} satisfies Config;
