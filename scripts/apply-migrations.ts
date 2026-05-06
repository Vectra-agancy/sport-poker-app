/**
 * Apply Prisma migration SQL files to a libSQL/Turso database via @libsql/client.
 *
 * Prisma CLI doesn't natively talk to libsql:// URLs, so we run the .sql files
 * ourselves. Tracks applied migrations in `_applied_migrations` to be idempotent.
 */
import "dotenv/config";
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

const raw = process.env.DATABASE_URL;
if (!raw) {
  throw new Error("DATABASE_URL is required");
}

const u = new URL(raw);
const authToken = u.searchParams.get("authToken") ?? process.env.TURSO_AUTH_TOKEN ?? undefined;
u.searchParams.delete("authToken");
const client = createClient({ url: u.toString(), authToken });

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

async function ensureTrackingTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _applied_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

async function getApplied(): Promise<Set<string>> {
  const res = await client.execute("SELECT name FROM _applied_migrations");
  return new Set(res.rows.map((r) => String(r.name)));
}

function splitStatements(sql: string): string[] {
  // Strip leading -- comment lines per block; Prisma writes one comment per
  // generated statement (e.g. "-- CreateTable\nCREATE TABLE ...").
  return sql
    .split(/;\s*\n/g)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter((s) => s.length > 0);
}

async function main() {
  await ensureTrackingTable();
  const applied = await getApplied();

  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) =>
      fs.statSync(path.join(migrationsDir, f)).isDirectory()
    )
    .sort();

  let appliedCount = 0;
  for (const folder of folders) {
    if (applied.has(folder)) {
      console.log(`✓ ${folder} already applied`);
      continue;
    }
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;
    const sql = fs.readFileSync(sqlPath, "utf-8");
    const statements = splitStatements(sql);

    console.log(`→ applying ${folder} (${statements.length} statements)`);
    for (const stmt of statements) {
      try {
        await client.execute(stmt);
      } catch (err) {
        console.error(`  ✗ failed on:\n${stmt.slice(0, 200)}\n`);
        throw err;
      }
    }
    await client.execute({
      sql: "INSERT INTO _applied_migrations (name) VALUES (?)",
      args: [folder],
    });
    appliedCount += 1;
    console.log(`  ✓ ${folder} done`);
  }

  console.log(`\n${appliedCount} migration(s) applied; ${folders.length - appliedCount} skipped.`);
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
