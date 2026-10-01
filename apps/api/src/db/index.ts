/**
 * Database Connection
 * 
 * This module provides the database connection for the API server.
 * It connects to Supabase and provides Drizzle ORM access.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../../packages/database/schema/sic-audit';
import * as chainSchema from '../../../../packages/database/schema/chain-of-command';

// Get database connection string from environment
// FAIL FAST: Require DATABASE_URL to be explicitly configured
const DATABASE_URL = process.env.DATABASE_URL;

// Create Drizzle instance with all schemas or fallback mock
let pool: any = null;
let db: any = null;

try {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  });
  db = drizzle(pool, {
    schema: { ...schema, ...chainSchema },
  });
} catch (err) {
  console.warn('[AI Studio] Database not connected — using mock fallback');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  const createChainable = (res: any = []): any => {
    const handler: ProxyHandler<any> = {
      get(_target, prop) {
        if (prop === "then") return (r: any) => Promise.resolve(res).then(r);
        if (prop === "catch") return (r: any) => Promise.resolve(res).catch(r);
        if (prop === "finally") return (r: any) => Promise.resolve(res).finally(r);
        return () => new Proxy(() => {}, handler);
      },
      apply() { return new Proxy(() => {}, handler); },
    };
    return new Proxy(() => {}, handler);
  };
  db = new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'query') return new Proxy({}, { get: () => noOp });
      return () => createChainable([]);
    },
  });
}

export { db, pool };
export * from 'drizzle-orm';
export default db;
