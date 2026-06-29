import { Pool, types } from "pg";

// BIGINT (COUNT) -> number instead of string
types.setTypeParser(20, (val: string) => parseInt(val, 10));
// NUMERIC (ROUND) -> number instead of string
types.setTypeParser(1700, (val: string) => parseFloat(val));
// DATE -> keep the raw "YYYY-MM-DD" wire string instead of pg's default JS
// Date conversion. A Date object survives the RSC server->client boundary
// as a real Date (not auto-stringified the way NextResponse.json() would),
// which breaks code expecting the string type declared in lib/types.ts.
types.setTypeParser(1082, (val: string) => val);

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Opt into SSL only when the connection string asks for it, rather than
  // guessing from the hostname — self-hosted/tunneled Postgres (e.g. via
  // ngrok) has no SSL listener even on a non-localhost host, while managed
  // providers (Neon, Supabase, RDS) document their strings with
  // `sslmode=require`.
  const requiresSsl = /sslmode=require/i.test(connectionString);

  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: requiresSsl ? { rejectUnauthorized: false } : false,
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
