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
const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/postgres';

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle instance with all schemas
export const db = drizzle(pool, {
  schema: { ...schema, ...chainSchema },
});

export * from 'drizzle-orm';
export { pool };

export default db;
