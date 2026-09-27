import { Pool } from "pg";

const globalForDb = globalThis as unknown as { tnlPool?: Pool };

export const db =
  globalForDb.tnlPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    max: 5
  });

if (process.env.NODE_ENV !== "production") globalForDb.tnlPool = db;
