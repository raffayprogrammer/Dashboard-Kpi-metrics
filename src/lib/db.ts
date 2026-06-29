import { Pool, types } from "pg";

// BIGINT (COUNT) -> number instead of string
types.setTypeParser(20, (val: string) => parseInt(val, 10));
// NUMERIC (ROUND) -> number instead of string
types.setTypeParser(1700, (val: string) => parseFloat(val));

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

// Constructed lazily (on first query, not on module import) so that
// `next build`'s static route analysis — which imports every route module
// without a real DATABASE_URL available — doesn't fail. Cached on
// globalThis so dev-mode HMR reuses one pool instead of exhausting
// connections on every module reload; each warm serverless instance in
// production keeps its own globalThis naturally.
export function getPool(): Pool {
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = createPool();
  }
  return globalThis.__pgPool;
}
