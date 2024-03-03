import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  driver: "pg",
  breakpoints: true,
  dbCredentials: {
    user: "root_user",
    password: "S3cret",
    host: "localhost",
    port: 5432,
    database: "root_db",
    ssl: false,
  },
} satisfies Config;
