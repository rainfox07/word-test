import "dotenv/config";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const rawUrl = process.env.DATABASE_URL ?? "file:./data/word-test.db";
const databaseUrl = rawUrl.startsWith("file:")
  ? `file:${path.isAbsolute(rawUrl.slice(5)) ? rawUrl.slice(5) : path.resolve(process.cwd(), rawUrl.slice(5))}`
  : rawUrl;

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
