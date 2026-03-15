import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create typed Drizzle client with full schema for relational queries
function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof createDb>;

// Module-level singleton — avoids multiple connections in dev hot-reload
let _db: Db | undefined;

export function getDb(): Db {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Named export for direct import convenience
export const db: Db = getDb();
