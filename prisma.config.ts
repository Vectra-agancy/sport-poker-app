import "dotenv/config";
import { defineConfig } from "prisma/config";

// Note on Turso/libSQL:
// Prisma CLI doesn't natively talk to libsql:// — `prisma migrate deploy`
// and `db push` will reject the scheme. We apply migrations via the custom
// `npm run db:deploy` script (scripts/apply-migrations.ts), which uses
// @libsql/client directly. `prisma generate` works without a live connection.
// Local dev with `file:./dev.db` continues to work for `prisma migrate dev`
// if you swap DATABASE_URL.

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
