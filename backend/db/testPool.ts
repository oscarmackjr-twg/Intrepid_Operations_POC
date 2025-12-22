// backend/db/testPool.ts
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.TEST_DB_URL,
});
